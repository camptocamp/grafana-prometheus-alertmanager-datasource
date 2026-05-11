import { DataSourceInstanceSettings, DataFrame } from '@grafana/data';
import { AlertmanagerDataSource } from './datasource';
import { GenericOptions, QueryRequest } from './types';

jest.mock('@grafana/runtime', () => ({
  getBackendSrv: () => ({
    fetch: jest.fn(),
  }),
  getTemplateSrv: () => ({
    replace: (value: string) => value,
  }),
}));

function makeDatasource() {
  const settings = {
    id: 1,
    uid: 'test-uid',
    type: 'camptocamp-prometheus-alertmanager-datasource',
    name: 'Test datasource',
    meta: { id: 'camptocamp-prometheus-alertmanager-datasource', name: 'Test', type: 'datasource' },
    readOnly: false,
    access: 'proxy',
    jsonData: {},
    url: 'http://localhost:9093',
  } as DataSourceInstanceSettings<GenericOptions>;

  return new AlertmanagerDataSource(settings);
}

describe('AlertmanagerDataSource silences', () => {
  test('filters silences by state and time overlap', () => {
    const datasource = makeDatasource();

    const silences = [
      {
        id: 'active-overlap',
        startsAt: '2026-04-02T10:00:00Z',
        endsAt: '2026-04-02T12:00:00Z',
        createdBy: 'ops',
        comment: 'maintenance',
        status: { state: 'active' },
        matchers: [{ name: 'service', value: 'api', isRegex: false, isEqual: true }],
      },
      {
        id: 'pending-no-overlap',
        startsAt: '2026-04-02T13:00:00Z',
        endsAt: '2026-04-02T14:00:00Z',
        createdBy: 'ops',
        comment: 'future maintenance',
        status: { state: 'pending' },
        matchers: [{ name: 'service', value: 'api', isRegex: false, isEqual: true }],
      },
      {
        id: 'expired-overlap',
        startsAt: '2026-04-02T09:30:00Z',
        endsAt: '2026-04-02T10:15:00Z',
        createdBy: 'ops',
        comment: 'past maintenance',
        status: { state: 'expired' },
        matchers: [{ name: 'service', value: 'api', isRegex: false, isEqual: true }],
      },
    ];

    const from = Date.parse('2026-04-02T10:00:00Z');
    const to = Date.parse('2026-04-02T11:00:00Z');

    const onlyActive = datasource.filterSilencesByTimeAndState(silences, from, to, 'active');
    expect(onlyActive.map((silence) => silence.id)).toEqual(['active-overlap']);

    const allStates = datasource.filterSilencesByTimeAndState(silences, from, to, 'all');
    expect(allStates.map((silence) => silence.id)).toEqual(['active-overlap', 'expired-overlap']);
  });

  test('builds silence dataframe with expected fields', () => {
    const datasource = makeDatasource();
    const frame = datasource.buildSilenceDataFrame('A', [
      {
        id: 'sil-1',
        startsAt: '2026-04-02T10:00:00Z',
        endsAt: '2026-04-02T12:00:00Z',
        createdBy: 'alice',
        comment: 'rolling update',
        status: { state: 'active' },
        updatedAt: '2026-04-02T10:05:00Z',
        matchers: [{ name: 'alertname', value: 'DiskFull', isRegex: false, isEqual: true }],
      },
    ]);

    expect(frame.refId).toBe('A');
    expect(frame.fields.map((field) => field.name)).toEqual([
      'StartsAt',
      'EndsAt',
      'DurationMs',
      'State',
      'CreatedBy',
      'Comment',
      'Matchers',
      'Tags',
      'ID',
      'UpdatedAt',
    ]);

    const fields = frame.fields as Array<{ values: any[] }>;

    expect(fields[3].values[0]).toBe('active');
    expect(fields[4].values[0]).toBe('alice');
    expect(fields[5].values[0]).toBe('rolling update');
    expect(fields[6].values[0]).toBe('alertname="DiskFull"');
    expect(fields[7].values[0]).toBe('alertname:DiskFull');
    expect(fields[8].values[0]).toBe('sil-1');
    expect(fields[2].values[0]).toBe(2 * 60 * 60 * 1000);
  });

  test('converts silence frame to region annotation events', () => {
    const datasource = makeDatasource();
    const frame = datasource.buildSilenceDataFrame('A', [
      {
        id: 'sil-anno',
        startsAt: '2026-04-02T10:00:00Z',
        endsAt: '2026-04-02T11:00:00Z',
        createdBy: 'bob',
        comment: 'db migration',
        status: { state: 'pending' },
        matchers: [{ name: 'service', value: 'db', isRegex: false, isEqual: true }],
      },
    ]) as DataFrame;

    const events = datasource.silenceFramesToAnnotationEvents([frame]);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      isRegion: true,
      title: 'Silence (pending) — service="db" — db migration',
      tags: ['silence', 'state:pending', 'service:db'],
    });
    expect(events[0].time).toBe(Date.parse('2026-04-02T10:00:00Z'));
    expect(events[0].timeEnd).toBe(Date.parse('2026-04-02T11:00:00Z'));
    expect(events[0].text).toContain('db migration');
    expect(events[0].text).toContain('bob');
  });

  test('routes query by queryType and keeps alerts as default', async () => {
    const datasource = makeDatasource();
    const emptyFrame = (refId: string): DataFrame => {
      return { refId, fields: [], length: 0 } as unknown as DataFrame;
    };

    const queryAlertsSpy = jest.spyOn(datasource, 'queryAlerts').mockResolvedValue(emptyFrame('A'));
    const querySilencesSpy = jest.spyOn(datasource, 'querySilences').mockResolvedValue(emptyFrame('B'));

    const request = {
      targets: [
        {
          refId: 'A',
          receiver: '',
          filters: '',
          active: true,
          silenced: false,
          inhibited: false,
        },
        {
          refId: 'B',
          queryType: 'silences',
          filters: '',
          silenceState: 'all',
        },
      ],
      scopedVars: {},
      range: { from: new Date('2026-04-02T10:00:00Z'), to: new Date('2026-04-02T12:00:00Z') },
    } as unknown as QueryRequest;

    const response = await datasource.query(request);

    expect(response.data).toHaveLength(2);
    expect(queryAlertsSpy).toHaveBeenCalledTimes(1);
    expect(querySilencesSpy).toHaveBeenCalledTimes(1);
  });

  test('annotation prepareQuery always enforces silences query type', () => {
    const datasource = makeDatasource();
    const query = datasource.annotations?.prepareQuery?.({
      enable: true,
      target: {
        queryType: 'alerts',
        silenceState: 'invalid',
      },
    } as any);

    expect(query).toBeDefined();
    expect(query?.queryType).toBe('silences');
    expect(query?.silenceState).toBe('all');
  });
});

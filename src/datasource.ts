import {
  AnnotationEvent,
  AnnotationQuery,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  PartialDataFrame,
  DataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { lastValueFrom, of } from 'rxjs';
import { AnnotationQueryEditor } from './components/AnnotationQueryEditor';
import { GenericOptions, CustomQuery, QueryRequest, DEFAULT_QUERY, SilenceState } from './types';

interface AlertmanagerMatcher {
  name: string;
  value: string;
  isRegex?: boolean;
  isEqual?: boolean;
}

interface AlertmanagerSilence {
  id: string;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  comment: string;
  status?: {
    state?: string;
  };
  updatedAt?: string;
  matchers?: AlertmanagerMatcher[];
}

export class AlertmanagerDataSource extends DataSourceApi<CustomQuery, GenericOptions> {
  url: string;
  withCredentials: boolean;
  headers: any;

  constructor(instanceSettings: DataSourceInstanceSettings<GenericOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url === undefined ? '' : instanceSettings.url;
    this.withCredentials = instanceSettings.withCredentials !== undefined;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }

    this.annotations = {
      QueryEditor: AnnotationQueryEditor,
      prepareAnnotation: (json) => {
        const annotation = (json ?? {}) as AnnotationQuery<CustomQuery>;
        const target = ((annotation.target as Partial<CustomQuery>) ?? {}) as Partial<CustomQuery>;

        return {
          ...annotation,
          target: {
            ...DEFAULT_QUERY,
            silenceState: 'all',
            ...target,
            queryType: 'silences',
          },
        } as AnnotationQuery<CustomQuery>;
      },
      prepareQuery: (annotation) => {
        if (annotation.enable === false) {
          return undefined;
        }

        const target = ((annotation.target as Partial<CustomQuery>) ?? {}) as Partial<CustomQuery>;
        return {
          ...DEFAULT_QUERY,
          ...target,
          refId: target.refId ?? 'Annotations',
          queryType: 'silences',
          silenceState: this.normalizeSilenceState(target.silenceState),
        } as CustomQuery;
      },
      processEvents: (_annotation, data) => {
        return of(this.silenceFramesToAnnotationEvents(data));
      },
    };
  }

  async query(options: QueryRequest): Promise<DataQueryResponse> {
    const promises = options.targets.map((target) => {
      const query = { ...DEFAULT_QUERY, ...target } as CustomQuery;

      if (query.hide) {
        return Promise.resolve({ refId: query.refId, fields: [], length: 0 } as DataFrame);
      }

      if (query.queryType === 'silences') {
        return this.querySilences(query, options);
      }

      return this.queryAlerts(query, options);
    });

    return Promise.all(promises).then((data) => {
      return { data };
    });
  }

  async queryAlerts(query: CustomQuery, options: QueryRequest): Promise<DataFrame> {
    const params: string[] = [];
    params.push(`active=${query.active ? 'true' : 'false'}`);
    params.push(`silenced=${query.silenced ? 'true' : 'false'}`);
    params.push(`inhibited=${query.inhibited ? 'true' : 'false'}`);

    if (query.receiver !== undefined && query.receiver.length > 0) {
      const receiver = getTemplateSrv().replace(query.receiver, options.scopedVars, this.interpolateQueryExpr);
      params.push(`receiver=${encodeURIComponent(receiver)}`);
    }

    this.interpolateFilters(query.filters, options).forEach((filter) => {
      params.push(`filter=${encodeURIComponent(filter)}`);
    });

    const request = this.doRequest({
      url: `${this.url}/api/v2/alerts?${params.join('&')}`,
      method: 'GET',
    }).then((observable) => lastValueFrom(observable));

    return request.then((data: any) => this.retrieveAlertsData(query, data));
  }

  async querySilences(query: CustomQuery, options: QueryRequest): Promise<DataFrame> {
    const silenceState = this.resolveSilenceState(query.silenceState, options);
    const silences = await this.fetchSilences(query, options);
    const filteredSilences = this.filterSilencesByTimeAndState(
      silences,
      options.range.from.valueOf(),
      options.range.to.valueOf(),
      silenceState
    );

    return Promise.resolve(this.buildSilenceDataFrame(query.refId, filteredSilences) as DataFrame);
  }

  async fetchSilences(query: CustomQuery, options: QueryRequest): Promise<AlertmanagerSilence[]> {
    const params: string[] = [];

    this.interpolateFilters(query.filters, options).forEach((filter) => {
      params.push(`filter=${encodeURIComponent(filter)}`);
    });

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    const request = this.doRequest({
      url: `${this.url}/api/v2/silences${queryString}`,
      method: 'GET',
    }).then((observable) => lastValueFrom(observable));

    return request.then((data: any) => {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    });
  }

  filterSilencesByTimeAndState(
    silences: AlertmanagerSilence[],
    rangeStartMs: number,
    rangeEndMs: number,
    silenceState: SilenceState
  ): AlertmanagerSilence[] {
    return silences.filter((silence) => {
      const state = (silence.status?.state ?? '').toLowerCase();
      if (silenceState !== 'all' && state !== silenceState) {
        return false;
      }

      const silenceStartMs = this.parseTimestamp(silence.startsAt);
      const silenceEndMs = this.parseTimestamp(silence.endsAt);
      if (silenceStartMs === null || silenceEndMs === null) {
        return false;
      }

      return silenceStartMs <= rangeEndMs && silenceEndMs >= rangeStartMs;
    });
  }

  buildSilenceDataFrame(refId: string, silences: AlertmanagerSilence[]): PartialDataFrame {
    const frame: PartialDataFrame = {
      refId,
      fields: [
        { name: 'StartsAt', type: FieldType.time, values: [] },
        { name: 'EndsAt', type: FieldType.time, values: [] },
        { name: 'DurationMs', type: FieldType.number, values: [] },
        { name: 'State', type: FieldType.string, values: [] },
        { name: 'CreatedBy', type: FieldType.string, values: [] },
        { name: 'Comment', type: FieldType.string, values: [] },
        { name: 'Matchers', type: FieldType.string, values: [] },
        { name: 'Tags', type: FieldType.string, values: [] },
        { name: 'ID', type: FieldType.string, values: [] },
        { name: 'UpdatedAt', type: FieldType.time, values: [] },
      ],
    };

    const fields = frame.fields as Array<{ values: any[] }>;

    silences.forEach((silence) => {
      const startsAtMs = this.parseTimestamp(silence.startsAt);
      const endsAtMs = this.parseTimestamp(silence.endsAt);
      if (startsAtMs === null || endsAtMs === null) {
        return;
      }

      const updatedAtMs = this.parseTimestamp(silence.updatedAt);
      const durationMs = Math.max(endsAtMs - startsAtMs, 0);
      const matchers = this.formatMatchers(silence.matchers);
      const tags = this.matchersToTags(silence.matchers).join(',');

      fields[0].values.push(startsAtMs);
      fields[1].values.push(endsAtMs);
      fields[2].values.push(durationMs);
      fields[3].values.push((silence.status?.state ?? '').toLowerCase());
      fields[4].values.push(silence.createdBy ?? '');
      fields[5].values.push(silence.comment ?? '');
      fields[6].values.push(matchers);
      fields[7].values.push(tags);
      fields[8].values.push(silence.id ?? '');
      fields[9].values.push(updatedAtMs ?? startsAtMs);
    });

    return frame;
  }

  async doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return getBackendSrv().fetch(options);
  }

  async testDatasource() {
    return this.doRequest({
      url: this.url,
      method: 'GET',
    }).then((response) =>
      lastValueFrom(response).then((data) => {
        if (data !== undefined) {
          if (data.ok) {
            return { status: 'success', message: 'Datasource is working', title: 'Success' };
          } else {
            return {
              status: 'error',
              message: `Datasource is not working: ${data.data}`,
              title: 'Error',
            };
          }
        }
        return {
          status: 'error',
          message: `Unknown error in datasource`,
          title: 'Error',
        };
      })
    );
  }

  buildDataFrame(refId: string, data: any): PartialDataFrame {
    const fields = [
      { name: 'Time', type: FieldType.time, values: [] },
      { name: 'SeverityValue', type: FieldType.number, values: [] },
    ];

    if (data.length > 0) {
      const annotations: string[] = data.map((alert: any) => Object.keys(alert.annotations)).flat();
      const labels: string[] = data.map((alert: any) => Object.keys(alert.labels)).flat();
      const alertstatus: string[] = ['alertstatus', 'alertstatus_code'];
      const attributes: string[] = [...new Set([...annotations, ...labels, ...alertstatus])];

      attributes.forEach((attribute: string) => {
        fields.push({
          name: attribute,
          type: FieldType.string,
          values: [],
        });
      });
    }
    const frame: PartialDataFrame = {
      refId: refId,
      fields: fields,
    };
    return frame;
  }

  parseAlertAttributes(alert: any, fields: any[]): Array<string | number> {
    let severityValue = 0;
    switch (alert.labels['severity']) {
      case 'critical':
        severityValue = 4;
        break;
      case 'high':
      case 'error':
        severityValue = 3;
        break;
      case 'warning':
        severityValue = 2;
        break;
      case 'info':
        severityValue = 1;
        break;
      default:
        break;
    }

    const row: Array<string | number> = [Date.parse(alert.startsAt), severityValue];
    fields.slice(2).forEach((element: any) => {
      if (element.name === 'alertstatus') {
        row.push(alert.status.state || '');
        return;
      }
      if (element.name === 'alertstatus_code') {
        switch (alert.status.state) {
          case 'unprocessed':
            row.push('0');
            return;
          case 'active':
            row.push('1');
            return;
          case 'suppressed':
            row.push('2');
            return;
          default:
            row.push('');
            return;
        }
      }
      row.push(alert.annotations[element.name] || alert.labels[element.name] || '');
    });
    return row;
  }

  retrieveAlertsData(query: CustomQuery, data: any): Promise<DataFrame> {
    const frame = this.buildDataFrame(query.refId, data.data);
    data.data.forEach((alert: any) => {
      const row: Array<string | number> = this.parseAlertAttributes(alert, frame.fields);
      frame.fields.forEach((field: any, index: number) => {
        field.values.push(row[index]);
      });
    });
    return Promise.resolve(frame as DataFrame);
  }

  interpolateQueryExpr(value: string | string[] = [], variable: any) {
    // if no multi or include all do not regexEscape
    if (!variable.multi && !variable.includeAll) {
      return alertmanagerRegularEscape(value);
    }

    if (typeof value === 'string') {
      return alertmanagerSpecialRegexEscape(value);
    }

    const escapedValues = value.map((val) => alertmanagerSpecialRegexEscape(val));
    if (escapedValues.length === 1) {
      return escapedValues[0];
    }

    return '(' + escapedValues.join('|') + ')';
  }

  interpolateFilters(filters: string | undefined, options: QueryRequest): string[] {
    if (filters === undefined || filters.length === 0) {
      return [];
    }

    const interpolatedFilters = getTemplateSrv().replace(filters, options.scopedVars, this.interpolateQueryExpr);
    return interpolatedFilters
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  normalizeSilenceState(state: SilenceState | string | undefined): SilenceState {
    if (state === 'active' || state === 'pending' || state === 'expired' || state === 'all') {
      return state;
    }

    return 'all';
  }

  resolveSilenceState(state: SilenceState | string | undefined, options: QueryRequest): SilenceState {
    if (typeof state !== 'string' || state.length === 0) {
      return 'all';
    }

    const interpolatedState = getTemplateSrv().replace(state, options.scopedVars).toLowerCase();
    return this.normalizeSilenceState(interpolatedState);
  }

  parseTimestamp(value: string | undefined): number | null {
    if (value === undefined || value.length === 0) {
      return null;
    }

    const timestampMs = Date.parse(value);
    if (Number.isNaN(timestampMs)) {
      return null;
    }

    return timestampMs;
  }

  matcherToString(matcher: AlertmanagerMatcher): string {
    const isEqual = matcher.isEqual !== false;
    const operator = matcher.isRegex ? (isEqual ? '=~' : '!~') : isEqual ? '=' : '!=';
    return `${matcher.name}${operator}"${matcher.value}"`;
  }

  formatMatchers(matchers: AlertmanagerMatcher[] | undefined): string {
    if (matchers === undefined || matchers.length === 0) {
      return '';
    }

    return matchers.map((matcher) => this.matcherToString(matcher)).join(', ');
  }

  matchersToTags(matchers: AlertmanagerMatcher[] | undefined): string[] {
    if (matchers === undefined || matchers.length === 0) {
      return [];
    }

    return matchers.map((matcher) => `${matcher.name}:${matcher.value}`);
  }

  getFieldValueAtIndex(field: any, index: number): any {
    if (field === undefined || field.values === undefined) {
      return undefined;
    }

    if (typeof field.values.get === 'function') {
      return field.values.get(index);
    }

    return field.values[index];
  }

  getFrameLength(frame: DataFrame, startsAtField?: any): number {
    if (Number.isFinite(frame.length)) {
      return frame.length;
    }

    if (startsAtField?.values === undefined) {
      return 0;
    }

    if (typeof startsAtField.values.length === 'number') {
      return startsAtField.values.length;
    }

    if (typeof startsAtField.values.toArray === 'function') {
      return startsAtField.values.toArray().length;
    }

    return 0;
  }

  getSilenceAnnotationColor(state: string): string {
    switch (state) {
      case 'active':
        return 'rgba(229, 84, 84, 0.9)';
      case 'pending':
        return 'rgba(87, 148, 242, 0.9)';
      case 'expired':
        return 'rgba(115, 125, 140, 0.8)';
      default:
        return 'rgba(255, 152, 0, 0.9)';
    }
  }

  buildSilenceAnnotationTitle(state: string, comment: string): string {
    const titlePrefix = state.length > 0 ? `Silence ${state}` : 'Silence';
    const normalizedComment = comment.trim();
    if (normalizedComment.length === 0) {
      return titlePrefix;
    }

    const truncatedComment = normalizedComment.length > 64 ? `${normalizedComment.slice(0, 61)}...` : normalizedComment;
    return `${titlePrefix}: ${truncatedComment}`;
  }

  silenceFramesToAnnotationEvents(frames: DataFrame[]): AnnotationEvent[] {
    const events: AnnotationEvent[] = [];

    frames.forEach((frame) => {
      const startsAtField = frame.fields.find((field) => field.name === 'StartsAt');
      const endsAtField = frame.fields.find((field) => field.name === 'EndsAt');
      const stateField = frame.fields.find((field) => field.name === 'State');
      const createdByField = frame.fields.find((field) => field.name === 'CreatedBy');
      const commentField = frame.fields.find((field) => field.name === 'Comment');
      const matchersField = frame.fields.find((field) => field.name === 'Matchers');
      const tagsField = frame.fields.find((field) => field.name === 'Tags');

      if (startsAtField === undefined || endsAtField === undefined) {
        return;
      }

      const frameLength = this.getFrameLength(frame, startsAtField);
      for (let index = 0; index < frameLength; index++) {
        const startAtValue = Number(this.getFieldValueAtIndex(startsAtField, index));
        const endAtValue = Number(this.getFieldValueAtIndex(endsAtField, index));
        if (!Number.isFinite(startAtValue) || !Number.isFinite(endAtValue)) {
          continue;
        }

        const state = String(this.getFieldValueAtIndex(stateField, index) ?? '');
        const createdBy = this.getFieldValueAtIndex(createdByField, index) ?? '';
        const comment = String(this.getFieldValueAtIndex(commentField, index) ?? '');
        const matchers = this.getFieldValueAtIndex(matchersField, index) ?? '';
        const tagValues = String(this.getFieldValueAtIndex(tagsField, index) ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        const annotationTags = ['silence'];
        if (state.length > 0) {
          annotationTags.push(`state:${state}`);
        }
        annotationTags.push(...tagValues.slice(0, 8));

        const textParts: string[] = [];
        if (comment.trim().length > 0) {
          textParts.push(comment.trim());
        } else {
          textParts.push('No comment');
        }
        if (String(createdBy).length > 0) {
          textParts.push(`Created by: ${createdBy}`);
        }
        if (String(matchers).length > 0) {
          textParts.push(`Matchers: ${matchers}`);
        }

        events.push({
          time: startAtValue,
          timeEnd: endAtValue,
          isRegion: true,
          title: this.buildSilenceAnnotationTitle(state, comment),
          text: textParts.join('\n'),
          tags: [...new Set(annotationTags)],
          color: this.getSilenceAnnotationColor(state),
        });
      }
    });

    return events;
  }
}

export function alertmanagerRegularEscape(value: any) {
  return typeof value === 'string' ? value.replace(/\\/g, '\\\\').replace(/'/g, "\\\\'") : value;
}

export function alertmanagerSpecialRegexEscape(value: any) {
  return typeof value === 'string' ? value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]\'+?()|]/g, '\\\\$&') : value;
}

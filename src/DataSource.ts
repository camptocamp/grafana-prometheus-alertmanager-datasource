import {
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import {
  AlertStateLabel,
  GenericOptions,
  CustomQuery,
  QueryRequest,
  FullDisplayMode,
  SummaryDisplayMode,
} from './types';

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
  }

  async query(options: QueryRequest): Promise<DataQueryResponse> {
    const promises = options.targets.map(query => {
      if (query.hide) {
        return Promise.resolve(new MutableDataFrame());
      }

      let params: string[] = [];
      const queryActive = query.active ? 'true' : 'false';
      const querySilenced = query.silenced ? 'true' : 'false';
      const queryInhibited = query.inhibited ? 'true' : 'false';
      params.push(`active=${queryActive}`);
      params.push(`silenced=${querySilenced}`);
      params.push(`inhibited=${queryInhibited}`);
      if (query.receiver !== undefined && query.receiver.length > 0) {
        params.push(`receiver=${query.receiver}`);
      }
      if (query.filters !== undefined && query.filters.length > 0) {
        query.filters = getTemplateSrv().replace(query.filters, options.scopedVars);
        query.filters.split(',').forEach(value => {
          params.push(`filter=${value}`);
        });
      }

      const request = this.doRequest({
        url: `${this.url}/api/v2/alerts?${params.join('&')}`,
        method: 'GET',
      }).then(request => request.toPromise());

      return request.then((data: any) => this.retrieveData(query, data));
    });

    return Promise.all(promises).then(data => {
      return { data };
    });
  }

  async testDatasource() {
    return this.doRequest({
      url: this.url,
      method: 'GET',
    }).then(response =>
      response.toPromise().then(data => {
        if (data.ok) {
          return { status: 'success', message: 'Datasource is working', title: 'Success' };
        } else {
          return {
            status: 'error',
            message: `Datasource is not working: ${data.data}`,
            title: 'Error',
          };
        }
      })
    );
  }

  async doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return getBackendSrv().fetch(options);
  }

  buildDataFrame(query: any, data: any): MutableDataFrame {
    const fields = [{ name: 'Time', type: FieldType.time }];

    if (data.length > 0) {
      const annotations: string[] = data
        .map((alert: any) => Object.keys(alert.annotations))
        .reduce((data: string[][]) => data.flat());
      const labels: string[] = data
        .map((alert: any) => Object.keys(alert.labels))
        .reduce((data: string[][]) => data.flat());
      const attributes: string[] = [...new Set([...annotations, ...labels])];

      attributes.forEach((attribute: string) => {
        fields.push({
          name: attribute,
          type: FieldType.string,
        });
      });
      if (query.displayState) {
        fields.push({
          name: AlertStateLabel,
          type: FieldType.string,
        });
      }
    }

    const frame = new MutableDataFrame({
      refId: query.refId,
      fields: fields,
    });
    return frame;
  }

  buildSummaryDataFrame(query: any): MutableDataFrame {
    var fields: Array<{ name: string; type: FieldType }> = [];
    if (query.active) {
      fields.push({
        name: 'Active',
        type: FieldType.number,
      });
    }
    if (query.silenced) {
      fields.push({
        name: 'Silenced',
        type: FieldType.number,
      });
    }
    if (query.inhibited) {
      fields.push({
        name: 'Inhibited',
        type: FieldType.number,
      });
    }
    const frame = new MutableDataFrame({
      refId: query.refId,
      fields: fields,
    });
    return frame;
  }

  parseAlertAttributes(alert: any, fields: any[], displayState: boolean): string[] {
    const row: string[] = [alert.startsAt];
    fields.slice(1).forEach((element: any) => {
      if (displayState && element.name === AlertStateLabel) {
        row.push(alert.status.state);
      } else {
        row.push(alert.annotations[element.name] || alert.labels[element.name] || '');
      }
    });
    return row;
  }

  parseAlertCounts(query: any, data: any): string[] {
    let active = 0;
    let silenced = 0;
    let inhibited = 0;
    data.data.forEach((alert: any) => {
      let state: string = alert.status.state;
      switch (state) {
        case 'active': {
          active++;
          break;
        }
        case 'suppressed': {
          silenced++;
          break;
        }
        case 'inhibited': {
          inhibited++;
          break;
        }
      }
    });
    const row: string[] = [];
    if (query.active) {
      row.push(active.toString());
    }
    if (query.silenced) {
      row.push(silenced.toString());
    }
    if (query.inhibited) {
      row.push(inhibited.toString());
    }
    return row;
  }

  retrieveData(query: any, data: any): Promise<MutableDataFrame> {
    if (query.displayMode === SummaryDisplayMode) {
      const frame = this.buildSummaryDataFrame(query);
      frame.appendRow(this.parseAlertCounts(query, data));
      return Promise.resolve(frame);
    } else if (query.displayMode === FullDisplayMode) {
      const frame = this.buildDataFrame(query, data.data);
      data.data.forEach((alert: any) => {
        const row: string[] = this.parseAlertAttributes(alert, frame.fields, query.displayState);
        frame.appendRow(row);
      });
      return Promise.resolve(frame);
    } else {
      return Promise.resolve(new MutableDataFrame());
    }
  }
}

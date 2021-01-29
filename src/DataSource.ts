import {
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { GenericOptions, CustomQuery, QueryRequest } from './types';

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

  buildDataFrame(refId: string, data: any) {
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
    }

    const frame = new MutableDataFrame({
      refId: refId,
      fields: fields,
    });
    return frame;
  }

  parseAlertAttributes(alert: any, fields: any[]) {
    const row: string[] = [alert.startsAt];
    fields.slice(1).forEach((element: any) => {
      row.push(alert.annotations[element.name] || alert.labels[element.name] || '');
    });
    return row;
  }

  retrieveData(query: any, data: any) {
    const frame = this.buildDataFrame(query.refId, data.data);
    data.data.forEach((alert: any) => {
      const row: string[] = this.parseAlertAttributes(alert, frame.fields);
      frame.fields.forEach((element: any) => {
        frame.appendRow(row);
      });
    });
    return Promise.resolve(frame);
  }
}

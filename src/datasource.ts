import {
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import { GenericOptions, CustomQuery, QueryRequest, DEFAULT_QUERY } from './types';

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
    const promises = options.targets.map((query) => {
      query = { ...DEFAULT_QUERY, ...query };
      if (query.hide) {
        return Promise.resolve(new MutableDataFrame());
      }

      let params: string[] = [];
      params.push(`active=${query.active ? 'true' : 'false'}`);
      params.push(`silenced=${query.silenced ? 'true' : 'false'}`);
      params.push(`inhibited=${query.inhibited ? 'true' : 'false'}`);
      if (query.receiver !== undefined && query.receiver.length > 0) {
        query.receiver = getTemplateSrv().replace(query.receiver, options.scopedVars, this.interpolateQueryExpr);
        params.push(`receiver=${encodeURIComponent(query.receiver)}`);
      }
      if (query.filters !== undefined && query.filters.length > 0) {
        query.filters = getTemplateSrv().replace(query.filters, options.scopedVars, this.interpolateQueryExpr);
        query.filters.split(',').forEach((value) => {
          params.push(`filter=${encodeURIComponent(value)}`);
        });
      }

      const request = this.doRequest({
        url: `${this.url}/api/v2/alerts?${params.join('&')}`,
        method: 'GET',
      }).then((request) => lastValueFrom(request));

      return request.then((data: any) => this.retrieveData(query, data));
    });

    return Promise.all(promises).then((data) => {
      return { data };
    });
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

  buildDataFrame(refId: string, data: any): MutableDataFrame {
    const fields = [
      { name: 'Time', type: FieldType.time },
      { name: 'SeverityValue', type: FieldType.number },
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
        });
      });
    }

    const frame = new MutableDataFrame({
      refId: refId,
      fields: fields,
    });
    return frame;
  }

  parseAlertAttributes(alert: any, fields: any[]): string[] {
    let severityValue = 4;
    switch (alert.labels['severity']) {
      case 'critical':
        severityValue = 1;
        break;
      case 'warning':
        severityValue = 2;
        break;
      case 'info':
        severityValue = 3;
        break;
      default:
        break;
    }

    const row: string[] = [alert.startsAt, severityValue];
    fields.slice(2).forEach((element: any) => {
      row.push(alert.annotations[element.name] || alert.labels[element.name] || '');
    });
    return row;
  }

  retrieveData(query: any, data: any): Promise<MutableDataFrame> {
    const frame = this.buildDataFrame(query.refId, data.data);
    data.data.forEach((alert: any) => {
      const row: string[] = this.parseAlertAttributes(alert, frame.fields);
      frame.appendRow(row);
    });
    return Promise.resolve(frame);
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
}

export function alertmanagerRegularEscape(value: any) {
  return typeof value === 'string' ? value.replace(/\\/g, '\\\\').replace(/'/g, "\\\\'") : value;
}

export function alertmanagerSpecialRegexEscape(value: any) {
  return typeof value === 'string' ? value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]\'+?()|]/g, '\\\\$&') : value;
}

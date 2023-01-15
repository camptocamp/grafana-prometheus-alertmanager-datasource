import {
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MetricFindValue,
  MutableDataFrame,
  ScopedVars,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { GenericOptions, CustomQuery, QueryRequest, defaultQuery } from './types';
import { lastValueFrom } from 'rxjs';

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

  async doQuery(queries: CustomQuery[], scopedVars?: ScopedVars): Promise<MutableDataFrame[]> {
    const promises = queries.map((query) => {
      query = { ...defaultQuery, ...query };
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
        query.filters = getTemplateSrv().replace(query.filters, scopedVars, this.interpolateQueryExpr);
        query.filters.split(',').forEach((value) => {
          params.push(`filter=${encodeURIComponent(value)}`);
        });
      }

      return this.doRequest({
        url: `${this.url}/api/v2/alerts?${params.join('&')}`,
        method: 'GET',
      })
        .then((data) => lastValueFrom(data))
        .then((data) => {
          return this.retrieveData(query, data);
        })
        .catch(() => {
          return new MutableDataFrame();
        });
    });

    return Promise.all(promises).then((data) => {
      return data;
    });
  }

  async query(options: QueryRequest): Promise<DataQueryResponse> {
    return this.doQuery(options.targets, options.scopedVars).then((data) => {
      return { data };
    });
  }

  async metricFindQuery(query: CustomQuery, options?: any): Promise<MetricFindValue[]> {
    if (typeof query.field === undefined) {
      return [];
    }
    const response = (await this.doQuery([query], options.scopedVars))[0];

    let fieldIndex = -1;
    response.fields.forEach((field, index) => {
      if (field.name === query.field) {
        fieldIndex = index;
      }
    });
    if (fieldIndex === -1) {
      return [];
    }

    const values = response.fields[fieldIndex].values.toArray().map((val) => {
      return val.toString();
    });
    const unique = [...new Set(values)];
    return unique.map((val) => {
      return { text: val };
    });
  }

  async testDatasource() {
    return this.doRequest({
      url: this.url,
      method: 'GET',
    })
      .then((response) => {
        return lastValueFrom(response);
      })
      .then((data) => {
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
      });
  }

  async doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return getBackendSrv().fetch(options);
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

    return new MutableDataFrame({
      refId: refId,
      fields: fields,
    });
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
  return typeof value === 'string' ? value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]'+?()|]/g, '\\\\$&') : value;
}

import { CustomAlertQuery } from './types';
import { DataQueryRequest, FieldType, MutableDataFrame } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { EditorQuery } from 'types';
import { AlertmanagerDataSource } from 'DataSource';

export function alertsQueryBuilder(
  datasource: AlertmanagerDataSource,
  query: CustomAlertQuery,
  options: DataQueryRequest<EditorQuery>
): string[] {
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
    query.filters = getTemplateSrv().replace(query.filters, options.scopedVars, datasource.interpolateQueryExpr);
    query.filters.split(',').forEach((value: any) => {
      params.push(`filter=${encodeURIComponent(value)}`);
    });
  }

  return params;
}

export function retrieveAlertsData(query: any, data: any): Promise<MutableDataFrame> {
  const frame = buildAlertDataFrame(query.refId, data.data);
  data.data.forEach((alert: any) => {
    const row: string[] = parseAlertAttributes(alert, frame.fields);
    frame.appendRow(row);
  });
  return Promise.resolve(frame);
}

function buildAlertDataFrame(refId: string, data: any): MutableDataFrame {
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

function parseAlertAttributes(alert: any, fields: any[]): string[] {
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

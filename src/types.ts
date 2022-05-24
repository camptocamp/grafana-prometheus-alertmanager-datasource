import { DataQuery, DataSourceJsonData, QueryEditorProps } from '@grafana/data';
import { AlertmanagerDataSource } from 'DataSource';

export interface EditorQuery extends DataQuery {
  scenario: string;
}

export type QEditorProps = QueryEditorProps<AlertmanagerDataSource, EditorQuery>;

export interface GenericOptions extends DataSourceJsonData {}

export type OnChangeType = (key: string | object, value?: any, runQuery?: boolean) => void;

export interface ScenarioProps<TsQuery extends EditorQuery>
  extends QueryEditorProps<AlertmanagerDataSource, EditorQuery> {
  query: TsQuery;
  onFormChange: OnChangeType;
}

export const scenarios = {
  alerts: 'alerts',
  silences: 'silences',
};

import { DataSourcePlugin } from '@grafana/data';
import { AlertmanagerDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { CustomQuery, GenericOptions } from './types';

export const plugin = new DataSourcePlugin<AlertmanagerDataSource, CustomQuery, GenericOptions>(AlertmanagerDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);

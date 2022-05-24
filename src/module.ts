import { DataSourcePlugin } from '@grafana/data';
import { ConfigEditor } from './ConfigEditor';
import { AlertmanagerDataSource } from './DataSource';
import { QueryEditor } from './QueryEditor';
import { EditorQuery, GenericOptions } from './types';

class GenericAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export const plugin = new DataSourcePlugin<AlertmanagerDataSource, EditorQuery, GenericOptions>(AlertmanagerDataSource)
  .setAnnotationQueryCtrl(GenericAnnotationsQueryCtrl)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);

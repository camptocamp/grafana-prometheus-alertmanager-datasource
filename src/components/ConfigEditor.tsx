import React from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { GenericOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<GenericOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  return (
    <div className="gf-form-group">
      <DataSourceHttpSettings
        defaultUrl={'http://localhost:8080'}
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
      />
    </div>
  );
}

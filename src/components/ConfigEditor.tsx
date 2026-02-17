import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import {
  ConnectionSettings,
  Auth,
  AdvancedHttpSettings,
  ConfigSection,
  convertLegacyAuthProps,
} from '@grafana/plugin-ui';
import { GenericOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<GenericOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;

  return (
    <>
      <ConnectionSettings
        config={options}
        onChange={onOptionsChange}
        urlPlaceholder="http://localhost:8080"
        description="Configure the connection to your Prometheus Alertmanager instance"
      />

      <Auth
        {...convertLegacyAuthProps({
          config: options,
          onChange: onOptionsChange,
        })}
      />

      <ConfigSection
        title="Advanced settings"
        description="Additional HTTP settings for fine-tuning the connection"
        isCollapsible
        isInitiallyOpen={false}
      >
        <AdvancedHttpSettings config={options} onChange={onOptionsChange} />
      </ConfigSection>
    </>
  );
}

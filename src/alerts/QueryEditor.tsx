import { LegacyForms } from '@grafana/ui';
import React, { ChangeEvent } from 'react';
import { CustomAlertQuery, defaultAlertQuery } from './types';
import { ScenarioProps } from 'types';
import { defaults } from 'lodash';

const { FormField, Switch } = LegacyForms;

const AlertsQueryEditor = (props: ScenarioProps<CustomAlertQuery>) => {
  const { onChange, onRunQuery } = props;
  const query = defaults(props.query, defaultAlertQuery);

  const onReceiverChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, receiver: event.target.value } as CustomAlertQuery);
    onRunQuery();
  };

  const onFiltersChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, filters: event.target.value } as CustomAlertQuery);
    onRunQuery();
  };

  const onActiveChange = () => {
    query.active = !query.active;
    onChange({ ...query });
    onRunQuery();
  };

  const onSilencedChange = () => {
    query.silenced = !query.silenced;
    onChange({ ...query });
    onRunQuery();
  };

  const onInhibitedChange = () => {
    query.inhibited = !query.inhibited;
    onChange({ ...query });
    onRunQuery();
  };

  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <FormField
            value={query.receiver}
            inputWidth={10}
            onChange={onReceiverChange}
            labelWidth={5}
            label="Receiver"
          />
        </div>
        <div className="gf-form">
          <FormField
            value={query.filters}
            inputWidth={30}
            onChange={onFiltersChange}
            labelWidth={15}
            label="Filters (comma separated key=value)"
          />
        </div>
        <div className="gf-form">
          <Switch label="Active" checked={query.active!} onChange={onActiveChange} />
        </div>
        <div className="gf-form">
          <Switch label="Silenced" checked={query.silenced!} onChange={onSilencedChange} />
        </div>
        <div className="gf-form">
          <Switch label="Inhibited" checked={query.inhibited!} onChange={onInhibitedChange} />
        </div>
      </div>
    </>
  );
};

export default AlertsQueryEditor;

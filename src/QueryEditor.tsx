import { QueryEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';

import React, { ChangeEvent, PureComponent } from 'react';
import { AlertmanagerDataSource } from './DataSource';

import { GenericOptions, CustomQuery, defaultQuery } from './types';

import './css/json-editor.css';

type Props = QueryEditorProps<AlertmanagerDataSource, CustomQuery, GenericOptions>;

const { FormField, Switch } = LegacyForms;

export class QueryEditor extends PureComponent<Props> {
  onReceiverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, receiver: event.target.value });
    onRunQuery();
  };

  onFiltersChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, filters: event.target.value });
    onRunQuery();
  };

  onActiveChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    query.active = !query.active;
    onChange({ ...query });
    onRunQuery();
  };

  onSilencedChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    query.silenced = !query.silenced;
    onChange({ ...query });
    onRunQuery();
  };

  onInhibitedChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    query.inhibited = !query.inhibited;
    onChange({ ...query });
    onRunQuery();
  };

  render() {
    const { receiver, filters, active, silenced, inhibited } = { ...defaultQuery, ...this.props.query };

    return (
      <>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              value={receiver}
              inputWidth={10}
              onChange={this.onReceiverChange}
              labelWidth={5}
              label="Receiver"
            />
          </div>
          <div className="gf-form">
            <FormField
              value={filters}
              inputWidth={30}
              onChange={this.onFiltersChange}
              labelWidth={15}
              label="Filters (comma separated key=value)"
            />
          </div>
          <div className="gf-form">
            <Switch label="Active" checked={active} onChange={this.onActiveChange} />
          </div>
          <div className="gf-form">
            <Switch label="Silenced" checked={silenced} onChange={this.onSilencedChange} />
          </div>
          <div className="gf-form">
            <Switch label="Inhibited" checked={inhibited} onChange={this.onInhibitedChange} />
          </div>
        </div>
      </>
    );
  }
}

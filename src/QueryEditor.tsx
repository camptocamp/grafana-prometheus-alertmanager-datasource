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
    let newQuery = { ...query };
    newQuery.active = !query.active;
    onChange(newQuery);
    onRunQuery();
  };

  onSilencedChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    let newQuery = { ...query };
    newQuery.silenced = !query.silenced;
    onChange(newQuery);
    onRunQuery();
  };

  onInhibitedChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    let newQuery = { ...query };
    newQuery.inhibited = !query.inhibited;
    onChange(newQuery);
    onRunQuery();
  };

  onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, field: event.target.value });
    onRunQuery();
  };

  baseRender(showField: boolean) {
    let { receiver, filters, active, silenced, inhibited, field } = { ...defaultQuery, ...this.props.query };

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
          {showField && (
            <div className="gf-form">
              <FormField
                value={field}
                inputWidth={10}
                onChange={this.onFieldChange}
                labelWidth={5}
                label="Field"
                tooltip="Variables are taken from the values of this field in the query result"
              />
            </div>
          )}
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

  render() {
    return this.baseRender(false);
  }
}

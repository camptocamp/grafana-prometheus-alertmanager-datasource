import { QueryEditorProps } from '@grafana/data';
import { InlineFormLabel, LegacyForms } from '@grafana/ui';
import { RadioButtonGroup } from '@grafana/ui';

import React, { ChangeEvent, PureComponent } from 'react';
import { AlertmanagerDataSource } from './DataSource';

import { GenericOptions, CustomQuery, FullDisplayMode, SummaryDisplayMode } from './types';

import './css/json-editor.css';

type Props = QueryEditorProps<AlertmanagerDataSource, CustomQuery, GenericOptions>;

const { FormField, Switch } = LegacyForms;

const DisplayModeOptions = [
  { label: 'Summary', description: 'Return a summary of alert counts per selected state.', value: SummaryDisplayMode },
  { label: 'Full', description: 'Return full results as a table.', value: FullDisplayMode },
];

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

  onDisplayModeChange = (option: string | undefined) => {
    const { onChange, query, onRunQuery } = this.props;
    if (option === undefined) {
      query.displayMode = FullDisplayMode;
    } else {
      query.displayMode = option;
    }
    onChange({ ...query });
    onRunQuery();
  };

  onDisplayStateChange = () => {
    const { onChange, query, onRunQuery } = this.props;
    query.displayState = !query.displayState;
    onChange({ ...query });
    onRunQuery();
  };

  render() {
    const { receiver, filters, active, silenced, inhibited, displayMode, displayState } = this.props.query;

    return (
      <>
        <div className="row">
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
          </div>
        </div>
        <div className="row">
          <InlineFormLabel width={8} tooltip="Controls which alerts, based on state, are returned by the query.">
            Selected States
          </InlineFormLabel>
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
        <div className="row">
          <InlineFormLabel
            width={8}
            tooltip="Controls whether all information is returned (full) or whether alerts are aggregated by state (count).
             Full information can be extended with each alert's state."
          >
            Display Mode
          </InlineFormLabel>
          <RadioButtonGroup<string>
            options={DisplayModeOptions}
            value={displayMode}
            onChange={this.onDisplayModeChange}
          />
          <Switch
            tooltip="Controls whether alert state information is included in the full result set."
            label="Show State"
            checked={displayState}
            onChange={this.onDisplayStateChange}
          />
        </div>
      </>
    );
  }
}

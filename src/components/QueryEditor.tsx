import React, { ChangeEvent } from 'react';
import { InlineFieldRow, InlineField, Input, InlineSwitch, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { AlertmanagerDataSource } from '../datasource';
import { GenericOptions, CustomQuery, DEFAULT_QUERY, QueryType, SilenceState } from '../types';

type Props = QueryEditorProps<AlertmanagerDataSource, CustomQuery, GenericOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onQueryTypeChange = (option: SelectableValue<QueryType>) => {
    onChange({ ...query, queryType: option.value ?? 'alerts' });
    onRunQuery();
  };

  const onReceiverChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, receiver: event.target.value });
    onRunQuery();
  };

  const onFiltersChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, filters: event.target.value });
    onRunQuery();
  };

  const onActiveChange = () => {
    onChange({ ...query, active: !query.active });
    onRunQuery();
  };

  const onSilencedChange = () => {
    onChange({ ...query, silenced: !query.silenced });
    onRunQuery();
  };

  const onInhibitedChange = () => {
    onChange({ ...query, inhibited: !query.inhibited });
    onRunQuery();
  };

  const onSilenceStateChange = (option: SelectableValue<SilenceState>) => {
    onChange({ ...query, silenceState: option.value ?? 'all' });
    onRunQuery();
  };

  const { queryType, receiver, filters, active, silenced, inhibited, silenceState } = { ...DEFAULT_QUERY, ...query };

  const queryTypeOptions: Array<SelectableValue<QueryType>> = [
    { label: 'Alerts', value: 'alerts' },
    { label: 'Silences', value: 'silences' },
  ];

  const silenceStateOptions: Array<SelectableValue<SilenceState>> = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Expired', value: 'expired' },
  ];

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Query type">
          <Select
            options={queryTypeOptions}
            value={queryTypeOptions.find((option) => option.value === queryType)}
            onChange={onQueryTypeChange}
            width={24}
          />
        </InlineField>

        <InlineField label="Filters (comma separated matchers)">
          <Input name="Filters input" onChange={onFiltersChange} value={filters} width={30} />
        </InlineField>
      </InlineFieldRow>

      {queryType === 'alerts' && (
        <>
          <InlineFieldRow>
            <InlineField label="Receiver">
              <Input name="Receiver input" onChange={onReceiverChange} value={receiver} width={24} />
            </InlineField>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Active">
              <InlineSwitch value={active} onChange={onActiveChange} />
            </InlineField>
            <InlineField label="Silenced">
              <InlineSwitch value={silenced} onChange={onSilencedChange} />
            </InlineField>
            <InlineField label="Inhibited">
              <InlineSwitch value={inhibited} onChange={onInhibitedChange} />
            </InlineField>
          </InlineFieldRow>
        </>
      )}

      {queryType === 'silences' && (
        <InlineFieldRow>
          <InlineField label="State">
            <Select
              options={silenceStateOptions}
              value={silenceStateOptions.find((option) => option.value === silenceState)}
              onChange={onSilenceStateChange}
              width={24}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </div>
  );
}

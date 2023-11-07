import React, { ChangeEvent } from 'react';
import { InlineFieldRow, InlineField, Input, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { AlertmanagerDataSource } from '../datasource';
import { GenericOptions, CustomQuery, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<AlertmanagerDataSource, CustomQuery, GenericOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onReceiverChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, receiver: event.target.value });
    onRunQuery();
  };

  const onFiltersChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, filters: event.target.value });
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

  const { receiver, filters, active, silenced, inhibited } = { ...DEFAULT_QUERY, ...query };

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Receiver">
          <Input name="Receiver input" onChange={onReceiverChange} value={receiver} width={10} />
        </InlineField>
        <InlineField label="Filters (comma separated key=value)">
          <Input name="Filters input" onChange={onFiltersChange} value={filters} width={30} />
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
    </div>
  );
}

import React, { ChangeEvent } from 'react';
import { InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue, AnnotationQuery } from '@grafana/data';
import { AlertmanagerDataSource } from '../datasource';
import { CustomQuery, SilenceState, DEFAULT_QUERY } from '../types';

type Props = QueryEditorProps<AlertmanagerDataSource, CustomQuery> & {
  annotation?: AnnotationQuery<CustomQuery>;
  onAnnotationChange?: (annotation: AnnotationQuery<CustomQuery>) => void;
};

export function AnnotationQueryEditor({ annotation, onAnnotationChange, onChange, onRunQuery }: Props) {
  const target = { ...DEFAULT_QUERY, ...(annotation?.target as Partial<CustomQuery>), queryType: 'silences' as const };

  const updateTarget = (nextTarget: Partial<CustomQuery>) => {
    const updatedTarget: CustomQuery = {
      ...(target as CustomQuery),
      ...nextTarget,
      queryType: 'silences',
    };

    if (onAnnotationChange !== undefined && annotation !== undefined) {
      onAnnotationChange({
        ...annotation,
        target: updatedTarget,
      });
    }

    onChange(updatedTarget);
    onRunQuery();
  };

  const onFiltersChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateTarget({ filters: event.target.value });
  };

  const onSilenceStateChange = (option: SelectableValue<SilenceState>) => {
    updateTarget({ silenceState: option.value ?? 'all' });
  };

  const silenceStateOptions: Array<SelectableValue<SilenceState>> = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Expired', value: 'expired' },
  ];

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Filters (comma separated matchers)">
          <Input name="Annotation filters input" onChange={onFiltersChange} value={target.filters} width={40} />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="State">
          <Select
            options={silenceStateOptions}
            value={silenceStateOptions.find((option) => option.value === target.silenceState)}
            onChange={onSilenceStateChange}
            width={24}
          />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}

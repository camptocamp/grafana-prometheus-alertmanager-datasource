import React from 'react';
import { InlineFormLabel, Select, PopoverContent, Checkbox } from '@grafana/ui';
import FormWrapper from './FormWrapper';
import { SelectableValue } from '@grafana/data';
import { SelectCommonProps } from '@grafana/ui/components/Select/types';

export type NotOptionsType = Partial<{
  onNotChange(e: any): any;
  showNotCheckbox: boolean;
  notCheckboxValue: boolean;
  notCheckboxLabel: string;
  notCheckboxDisabled: boolean;
}>;

export interface FormSelectProps extends SelectCommonProps<any> {
  label: string;
  name?: string;
  value: SelectableValue | string;
  options: any;
  queryKeyword?: boolean;
  disabled?: boolean;
  defaultValue?: SelectableValue;
  noOptionsMessage?: string;
  searchable?: boolean | true;
  labelWidth?: number | 14;
  inputWidth?: number | 30;
  placeholder?: string | '-';
  tooltip?: PopoverContent;
  className?: string;
  isLoading?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  onChange(event?: any): any;
  onInputChange?(str: string, options?: any): any;
  notOptions?: NotOptionsType;
  error?: boolean;
  required?: boolean;
}

/**
 * Default select field including label. Select element is grafana/ui <Select />.
 */
const FormSelect: React.FC<FormSelectProps> = (props) => {
  const {
    label,
    tooltip,
    searchable = true,
    disabled,
    queryKeyword,
    placeholder = '-',
    labelWidth = 14,
    inputWidth = 30,
    className = '',
    notOptions,
    error,
    required,
    ...remainingProps
  } = props;
  const {
    showNotCheckbox,
    notCheckboxValue = false,
    notCheckboxLabel = 'NOT',
    onNotChange,
    notCheckboxDisabled,
  } = notOptions || {};
  return (
    <FormWrapper
      error={error || (required && (props.isMulti ? !props.value?.length : !props.value))}
      disabled={disabled}
      stretch={!inputWidth}
    >
      <InlineFormLabel
        className={queryKeyword ? `query-keyword ${className}` : className}
        width={labelWidth}
        tooltip={tooltip}
      >
        {label}
      </InlineFormLabel>
      <Select
        prefix={notCheckboxValue ? '!' : null}
        menuPlacement={'bottom'}
        disabled={disabled}
        width={inputWidth}
        isSearchable={searchable}
        placeholder={placeholder}
        {...remainingProps}
      />
      {showNotCheckbox && (
        <InlineFormLabel width={3.5}>
          <Checkbox
            className={'notCheckbox'}
            value={notCheckboxValue}
            label={notCheckboxLabel}
            onChange={onNotChange}
            disabled={notCheckboxDisabled}
          />
        </InlineFormLabel>
      )}
    </FormWrapper>
  );
};

export default FormSelect;

import defaults from 'lodash/defaults';
import React, { useCallback } from 'react';
import { EditorQuery, QEditorProps, scenarios } from './types';
import AlertsQueryEditor from './alerts/QueryEditor';
import FormSelect from './components/FormSelect';

const scenarioOptions = {
  [scenarios.alerts]: { label: 'Alerts', value: scenarios.alerts },
};

const defaultQuery: Partial<EditorQuery> = {
  scenario: scenarios.alerts,
};

export const QueryEditor = (props: QEditorProps) => {
  const query = defaults(props.query, defaultQuery);

  const onFormChange = useCallback(
    (key: any, value: { value: any }, forceRunQuery = false) => {
      let newQuery;
      if (typeof key === 'object') {
        newQuery = { ...query, ...key };
      }
      if (typeof key === 'string') {
        newQuery = { ...query, [key]: value?.value ?? value ?? '' };
      }
      props.onChange(newQuery);
      forceRunQuery && props.onRunQuery();
    },
    [query]
  );

  const onScenarioChange = useCallback((scenario: any) => {
    props.onChange({ scenario: scenario.value } as EditorQuery);
  }, []);

  const editorsProps = {
    ...props,
    onFormChange,
  };

  let editor: any;
  switch (query.scenario) {
    case scenarios.alerts:
      editor = <AlertsQueryEditor {...editorsProps} />;
      break;
    default:
      editor = null;
  }

  return (
    <div className={'gf-form-group'}>
      <div className={'gf-form'}>
        <FormSelect
          queryKeyword
          inputWidth={0}
          label={'Scenario'}
          tooltip={'Select scenario'}
          value={query.scenario}
          options={Object.values(scenarioOptions)}
          onChange={onScenarioChange}
        />
      </div>
      {editor}
    </div>
  );
};

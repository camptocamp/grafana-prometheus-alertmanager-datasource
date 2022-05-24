import { DataQuery, DataQueryRequest, DataSourceJsonData } from '@grafana/data';

export interface DataSourceOptions extends DataSourceJsonData {}

export interface QueryRequest extends DataQueryRequest<CustomQuery> {
  adhocFilters?: any[];
}

export const FullDisplayMode = 'full';
export const SummaryDisplayMode = 'summary';
export const DefaultDisplayMode = FullDisplayMode;
export const AlertStateLabel = 'Alert State';

export interface CustomQuery extends DataQuery {
  target?: string;
  receiver: string;
  filters: string;
  active: boolean;
  silenced: boolean;
  inhibited: boolean;
  displayMode: string;
  displayState: boolean;
}

export const defaultQuery: Partial<CustomQuery> = { displayMode: DefaultDisplayMode };

export interface GenericOptions extends DataSourceJsonData {}

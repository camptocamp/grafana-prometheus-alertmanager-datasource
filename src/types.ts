import { DataSourceJsonData, DataQueryRequest } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface QueryRequest extends DataQueryRequest<CustomQuery> {
  adhocFilters?: any[];
}

export interface CustomQuery extends DataQuery {
  target?: string;
  receiver: string;
  filters: string;
  active: boolean;
  silenced: boolean;
  inhibited: boolean;
}

export const DEFAULT_QUERY: Partial<CustomQuery> = {
  active: true,
  silenced: false,
  inhibited: false,
};

export interface GenericOptions extends DataSourceJsonData {}

import { DataQuery, DataQueryRequest, DataSourceJsonData } from '@grafana/data';

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

export const defaultQuery: Partial<CustomQuery> = {
  active: true,
};

export interface GenericOptions extends DataSourceJsonData {}

import { DataSourceJsonData, DataQueryRequest } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export type QueryType = 'alerts' | 'silences';
export type SilenceState = 'active' | 'pending' | 'expired' | 'all';

export interface QueryRequest extends DataQueryRequest<CustomQuery> {
  adhocFilters?: any[];
}

export interface CustomQuery extends DataQuery {
  target?: string;
  queryType: QueryType;
  receiver: string;
  filters: string;
  active: boolean;
  silenced: boolean;
  inhibited: boolean;
  silenceState: SilenceState;
}

export const DEFAULT_QUERY: Partial<CustomQuery> = {
  queryType: 'alerts',
  receiver: '',
  filters: '',
  active: true,
  silenced: false,
  inhibited: false,
  silenceState: 'all',
};

export interface GenericOptions extends DataSourceJsonData {}

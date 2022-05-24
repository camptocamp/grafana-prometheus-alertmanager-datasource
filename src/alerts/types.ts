import { DataQueryRequest, DataSourceJsonData } from '@grafana/data';
import { EditorQuery } from '../types';

export interface QueryRequest extends DataQueryRequest<CustomAlertQuery> {
  adhocFilters?: any[];
}

export interface CustomAlertQuery extends EditorQuery {
  target?: string;
  receiver?: string;
  filters?: string;
  active?: boolean;
  silenced?: boolean;
  inhibited?: boolean;
}

export const defaultAlertQuery: Partial<CustomAlertQuery> = {
  active: true,
};

export interface GenericOptions extends DataSourceJsonData {}

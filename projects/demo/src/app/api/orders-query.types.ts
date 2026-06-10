import type { SortModelItem } from 'ag-grid-community';
import type { OrderRow } from '../order-row.model';

export interface OrdersPageRequest {
  startRow: number;
  endRow: number;
  sortModel: SortModelItem[];
  filterModel: unknown;
}

export interface OrdersPageResponse {
  items: OrderRow[];
  total: number;
}

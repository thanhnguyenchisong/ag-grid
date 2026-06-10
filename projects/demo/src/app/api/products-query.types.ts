import type { SortModelItem } from 'ag-grid-community';
import type { ProductRow } from '../product-row.model';

export interface ProductsPageRequest {
  startRow: number;
  endRow: number;
  sortModel: SortModelItem[];
  filterModel: unknown;
}

export interface ProductsPageResponse {
  items: ProductRow[];
  total: number;
}

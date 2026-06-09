import type { SortModelItem } from 'ag-grid-community';
import type { OrderRow } from './order-row.model';

export interface OrdersQueryRequest {
  startRow: number;
  endRow: number;
  sortModel: SortModelItem[];
  filterModel: unknown;
}

const STATUSES: OrderRow['status'][] = ['pending', 'paid', 'cancelled'];
const CUSTOMERS = [
  'Acme Corp',
  'Globex',
  'Initech',
  'Umbrella',
  'Stark Industries',
  'Wayne Enterprises',
];

/** In-memory dataset simulating a backend table (~500 rows). */
export const ORDERS_MOCK_DB: OrderRow[] = Array.from({ length: 500 }, (_, i) => {
  const n = i + 1;
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + (i % 365));
  return {
    id: String(n),
    orderNo: `ORD-${String(n).padStart(5, '0')}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    status: STATUSES[i % STATUSES.length],
    total: Math.round((n * 137.5 + (i % 7) * 1000) * 100) / 100,
    createdAt: date.toISOString().slice(0, 10),
  };
});

export interface OrdersQueryResult {
  rows: OrderRow[];
  total: number;
}

/** Simulates server-side sort / filter / block loading (Infinite or SSRM). */
export function queryOrdersMock(request: OrdersQueryRequest): OrdersQueryResult {
  let rows = [...ORDERS_MOCK_DB];

  rows = applyFilterModel(rows, request.filterModel);
  rows = applySortModel(rows, request.sortModel);

  const total = rows.length;
  const start = request.startRow;
  const end = request.endRow;

  return { rows: rows.slice(start, end), total };
}

function applySortModel(
  rows: OrderRow[],
  sortModel: SortModelItem[],
): OrderRow[] {
  if (!sortModel?.length) return rows;

  const { colId, sort } = sortModel[0];
  const dir = sort === 'desc' ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = a[colId];
    const bv = b[colId];
    if (av == null && bv == null) return 0;
    if (av == null) return -dir;
    if (bv == null) return dir;
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir;
    }
    return String(av).localeCompare(String(bv)) * dir;
  });
}

function applyFilterModel(rows: OrderRow[], filterModel: unknown): OrderRow[] {
  if (!filterModel || typeof filterModel !== 'object') return rows;
  return rows.filter((row) =>
    Object.entries(filterModel as Record<string, unknown>).every(([field, model]) =>
      matchesFilter(row, field, model as Record<string, unknown>),
    ),
  );
}

function matchesFilter(
  row: OrderRow,
  field: string,
  model: Record<string, unknown>,
): boolean {
  const value = row[field];
  const filterType = model['filterType'] as string | undefined;

  if (filterType === 'text') {
    const filter = String(model['filter'] ?? '').toLowerCase();
    if (!filter) return true;
    const type = model['type'] as string | undefined;
    const cell = String(value ?? '').toLowerCase();
    if (type === 'equals') return cell === filter;
    return cell.includes(filter);
  }

  if (filterType === 'number') {
    const num = Number(value);
    const filter = Number(model['filter']);
    if (Number.isNaN(filter)) return true;
    const type = model['type'] as string | undefined;
    switch (type) {
      case 'greaterThan':
        return num > filter;
      case 'lessThan':
        return num < filter;
      case 'equals':
        return num === filter;
      default:
        return num >= filter;
    }
  }

  if (filterType === 'set') {
    const values = model['values'] as unknown[] | undefined;
    if (!values?.length) return true;
    return values.includes(value);
  }

  if (filterType === 'date') {
    const cell = String(value ?? '');
    const from = model['dateFrom'] as string | undefined;
    const to = model['dateTo'] as string | undefined;
    if (from && cell < from.slice(0, 10)) return false;
    if (to && cell > to.slice(0, 10)) return false;
    return true;
  }

  return true;
}

/** Simulates network latency (ms). */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

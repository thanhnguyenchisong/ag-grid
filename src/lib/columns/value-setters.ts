import type { ValueSetterParams } from 'ag-grid-community';
import type { RowData } from '../models/ag-grid.types';
import type { BooleanKeys } from './type-utils';

/** Type-safe boolean valueSetter — use with {@link BooleanKeys} on `*RowFields` types. */
export function booleanValueSetter<TData extends RowData, TFields extends Record<string, unknown>>(
  key: BooleanKeys<TFields> | (keyof TFields & string),
): (params: ValueSetterParams<TData>) => boolean {
  return (params) => {
    if (!params.data) return false;
    (params.data as RowData)[key as string] =
      params.newValue === true || params.newValue === 'true';
    return true;
  };
}

/** Store money in cents; grid edits/display in major units. */
export function moneyCentsValueSetter<TData extends RowData>(field: string) {
  return (params: ValueSetterParams<TData>): boolean => {
    if (!params.data) return false;
    const major = Number(params.newValue);
    if (Number.isNaN(major)) return false;
    (params.data as RowData)[field] = Math.round(major * 100);
    return true;
  };
}

export function moneyCentsValueGetter<TData extends RowData>(field: string) {
  return (params: { data?: TData | null }) => {
    const cents = (params.data as RowData | undefined)?.[field];
    if (cents == null || cents === '') return null;
    return Number(cents) / 100;
  };
}

export function moneyCentsValueParser() {
  return (params: { newValue: unknown }) => {
    const raw = String(params.newValue ?? '').replace(/[^\d.,-]/g, '').replace(',', '.');
    const n = Number(raw);
    return Number.isNaN(n) ? 0 : n;
  };
}

export function moneyDisplayFormatter(currency = '₫') {
  return (params: { value: unknown }) => {
    if (params.value == null || params.value === '') return '';
    return (
      new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(
        Number(params.value),
      ) + ` ${currency}`
    );
  };
}

export function percentValueParser() {
  return (params: { newValue: unknown }) => {
    const raw = String(params.newValue ?? '').replace('%', '').trim();
    const n = Number(raw);
    return Number.isNaN(n) ? 0 : n;
  };
}

export function percentDisplayFormatter() {
  return (params: { value: unknown }) => {
    if (params.value == null || params.value === '') return '';
    return `${Number(params.value).toFixed(1)}%`;
  };
}

import type { FieldValidator, RowData } from '../models/ag-grid.types';

/** Value must be non-empty (after trim for strings). */
export function required<T extends RowData = RowData>(
  message = 'Required',
): FieldValidator<T> {
  return (value) => {
    if (value == null) return message;
    if (typeof value === 'string' && !value.trim()) return message;
    return null;
  };
}

/** Valid email format. */
export function email<T extends RowData = RowData>(
  message = 'Invalid email',
): FieldValidator<T> {
  return (value) => {
    if (value == null || value === '') return null;
    const s = String(value).trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : message;
  };
}

/** Combine validators — first error wins. */
export function combine<T extends RowData = RowData>(
  ...validators: FieldValidator<T>[]
): FieldValidator<T> {
  return (value, row) => {
    for (const v of validators) {
      const err = v(value, row);
      if (err) return err;
    }
    return null;
  };
}

/** Minimum string length. */
export function minLength<T extends RowData = RowData>(
  min: number,
  message?: string,
): FieldValidator<T> {
  return (value) => {
    if (value == null || value === '') return null;
    return String(value).length >= min
      ? null
      : (message ?? `Min ${min} characters`);
  };
}

/** Minimum numeric value. */
export function minValue<T extends RowData = RowData>(
  min: number,
  message?: string,
): FieldValidator<T> {
  return (value) => {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= min
      ? null
      : (message ?? `Min value is ${min}`);
  };
}

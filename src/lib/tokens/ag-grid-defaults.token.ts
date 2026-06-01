import { InjectionToken } from '@angular/core';
import type { GridOptions } from 'ag-grid-community';
import type { GridContext, RowData } from '../models/ag-grid.types';

/**
 * App-wide grid defaults — register once in `app.config.ts`.
 * Every feature grid that extends {@link AgGridBase} inherits these options.
 */
export interface AgGridDefaults<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  gridOptions?: GridOptions<TData>;
  themeClass?: string;
  defaultHeight?: string;
}

export const AG_GRID_DEFAULTS = new InjectionToken<AgGridDefaults>(
  'AG_GRID_DEFAULTS',
);

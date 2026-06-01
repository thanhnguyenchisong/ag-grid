/*
 * Public API — import from '@app/ag-grid-common' in your Angular 20 app.
 */

export { AgGridBase } from './lib/core/ag-grid-base';
export { ColumnDefinitionFactory } from './lib/core/column-definition.factory';
export { GridConfigBuilder } from './lib/core/grid-config.builder';
export { PluginRegistry } from './lib/core/grid-plugin';
export type { GridPlugin } from './lib/core/grid-plugin';

export { AgGridTableComponent } from './lib/components/ag-grid-table.component';

export {
  AG_GRID_DEFAULTS,
  type AgGridDefaults,
} from './lib/tokens/ag-grid-defaults.token';
export { provideAgGridDefaults } from './lib/providers/provide-ag-grid';

export type {
  ActionColumnOptions,
  AgGridConfig,
  AgGridLifecycleHooks,
  AgGridTableHost,
  DeepPartial,
  GridContext,
  RowData,
  TextColumnOptions,
} from './lib/models/ag-grid.types';

export type {
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RefreshServerSideParams,
} from 'ag-grid-community';

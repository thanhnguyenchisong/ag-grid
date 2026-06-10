/*
 * Public API — import from '@app/ag-grid-common' in your Angular 20 app.
 */

export { AgGridBase } from './lib/core/ag-grid-base';
export { ColumnDefinitionFactory } from './lib/core/column-definition.factory';
export { ColumnSchemaBuilder } from './lib/columns/column-schema-builder';
export { GridConfigBuilder } from './lib/core/grid-config.builder';
export { PluginRegistry } from './lib/core/grid-plugin';
export type { GridPlugin } from './lib/core/grid-plugin';

export { AgGridTableComponent } from './lib/components/ag-grid-table.component';

export {
  AG_GRID_DEFAULTS,
  type AgGridDefaults,
} from './lib/tokens/ag-grid-defaults.token';
export {
  provideAgGrid,
  provideAgGridDefaults,
  registerAgGridEnterpriseModules,
  type ProvideAgGridOptions,
} from './lib/providers/provide-ag-grid';

export type {
  ActionColumnOptions,
  AgGridConfig,
  AgGridLifecycleHooks,
  AgGridTableHost,
  DeepPartial,
  FieldValidator,
  GridContext,
  RowData,
  TextColumnOptions,
} from './lib/models/ag-grid.types';

export type {
  ColumnGroupSchema,
  ColumnKind,
  ColumnSchema,
  FieldPipeline,
  FieldPipelineMap,
} from './lib/columns/column-schema.types';
export type { BooleanKeys } from './lib/columns/type-utils';
export {
  booleanValueSetter,
  moneyCentsValueGetter,
  moneyCentsValueParser,
  moneyCentsValueSetter,
  moneyDisplayFormatter,
  percentDisplayFormatter,
  percentValueParser,
} from './lib/columns/value-setters';

export {
  applyFieldValidation,
  getFieldValidationError,
  VALIDATION_WARNING_CELL_CLASS,
} from './lib/validation/field-validation';
export {
  combine,
  email,
  minLength,
  minValue,
  required,
} from './lib/validation/validators';

export type {
  IDatasource,
  IGetRowsParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RefreshServerSideParams,
} from 'ag-grid-community';

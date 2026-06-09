import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  IErrorValidationParams,
} from 'ag-grid-community';
import type { FieldValidator, RowData } from '../models/ag-grid.types';

/** CSS class on invalid cells — yellow warning background (styled in AgGridTableComponent). */
export const VALIDATION_WARNING_CELL_CLASS = 'ag-grid-common-cell--warning';

const BADGE_CLASS = 'ag-grid-common-cell__badge';
const VALUE_CLASS = 'ag-grid-common-cell__value';
const WRAP_CLASS = 'ag-grid-common-cell__wrap';

export function getFieldValidationError<TData extends RowData>(
  validator: FieldValidator<TData> | undefined,
  value: unknown,
  data: TData | undefined,
): string | null {
  if (!validator || !data) return null;
  return validator(value, data);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDisplayValue<TData>(
  params: ICellRendererParams<TData>,
): string {
  if (params.valueFormatted != null && params.valueFormatted !== '') {
    return String(params.valueFormatted);
  }
  if (params.value == null) return '';
  return String(params.value);
}

function validationCellRenderer<TData extends RowData>(
  validator: FieldValidator<TData>,
): ColDef<TData>['cellRenderer'] {
  return (params: ICellRendererParams<TData>) => {
    const display = formatDisplayValue(params);
    const error = getFieldValidationError(
      validator,
      params.value,
      params.data,
    );

    if (!error) {
      return display;
    }

    return (
      `<span class="${WRAP_CLASS}">` +
      `<span class="${VALUE_CLASS}">${escapeHtml(display)}</span>` +
      `<span class="${BADGE_CLASS}" title="${escapeHtml(error)}">!</span>` +
      `</span>`
    );
  };
}

function validationCellClassRules<TData extends RowData>(
  validator: FieldValidator<TData>,
): ColDef<TData>['cellClassRules'] {
  return {
    [VALIDATION_WARNING_CELL_CLASS]: (params: CellClassParams<TData>) =>
      !!getFieldValidationError(validator, params.value, params.data),
  };
}

function validationEditorParams<TData extends RowData>(
  validator: FieldValidator<TData>,
  existing?: ColDef<TData>['cellEditorParams'],
): ColDef<TData>['cellEditorParams'] {
  const base =
    typeof existing === 'function' ? undefined : { ...(existing ?? {}) };

  return {
    ...base,
    getValidationErrors: (params: IErrorValidationParams<TData>) => {
      const custom =
        typeof existing === 'object' && existing?.getValidationErrors
          ? existing.getValidationErrors(params)
          : null;
      if (custom?.length) return custom;

      const err = getFieldValidationError(
        validator,
        params.value,
        params.cellEditorParams.data,
      );
      return err ? [err] : null;
    },
  };
}

/**
 * Apply yellow "!" warning display + edit-time validation to a column def.
 */
export function applyFieldValidation<TData extends RowData>(
  colDef: ColDef<TData>,
  validator: FieldValidator<TData>,
): ColDef<TData> {
  const rules = validationCellClassRules(validator);
  const mergedRules = { ...colDef.cellClassRules, ...rules };

  return {
    ...colDef,
    cellClassRules: mergedRules,
    cellRenderer: validationCellRenderer(validator),
    cellEditorParams: validationEditorParams(
      validator,
      colDef.cellEditorParams,
    ),
  };
}

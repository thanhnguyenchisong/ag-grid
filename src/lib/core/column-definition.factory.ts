import type { ColDef, ColDefField, ValueFormatterParams } from 'ag-grid-community';
import type {
  ActionColumnOptions,
  FieldValidator,
  RowData,
  TextColumnOptions,
} from '../models/ag-grid.types';
import { applyFieldValidation } from '../validation/field-validation';

/** Shared column builders — use inside any {@link AgGridBase} subclass. */
export class ColumnDefinitionFactory<TData extends RowData = RowData> {
  text(options: TextColumnOptions<TData>): ColDef<TData> {
    const {
      field,
      headerName,
      flex = 1,
      minWidth = 100,
      sortable = true,
      filter = true,
      pinned,
      validate,
      extra = {},
    } = options;

    let col: ColDef<TData> = {
      field: field as ColDefField<TData>,
      headerName: headerName ?? this.toHeaderName(field),
      flex,
      minWidth,
      sortable,
      filter,
      pinned,
      ...extra,
    };

    if (validate) {
      col = applyFieldValidation(col, validate);
    }

    return col;
  }

  number(
    field: keyof TData & string,
    overrides: Partial<ColDef<TData>> & {
      validate?: FieldValidator<TData>;
    } = {},
  ): ColDef<TData> {
    const { validate, ...colOverrides } = overrides;
    return this.text({
      field,
      validate,
      filter: 'agNumberColumnFilter',
      extra: {
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams<TData>) =>
          params.value != null ? String(params.value) : '',
        ...colOverrides,
      },
    });
  }

  date(
    field: keyof TData & string,
    overrides: Partial<ColDef<TData>> & {
      validate?: FieldValidator<TData>;
    } = {},
  ): ColDef<TData> {
    const { validate, ...colOverrides } = overrides;
    return this.text({
      field,
      validate,
      filter: 'agDateColumnFilter',
      extra: {
        valueFormatter: (params: ValueFormatterParams<TData>) => {
          if (params.value == null) return '';
          const d =
            params.value instanceof Date
              ? params.value
              : new Date(String(params.value));
          return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
        },
        ...colOverrides,
      },
    });
  }

  checkbox(overrides: Partial<ColDef<TData>> = {}): ColDef<TData> {
    return {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 48,
      maxWidth: 48,
      pinned: 'left',
      lockPosition: true,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false,
      ...overrides,
    };
  }

  actions(options: ActionColumnOptions<TData> = {}): ColDef<TData> {
    const {
      headerName = '',
      width = 120,
      cellRenderer,
      cellRendererParams,
      onCellClicked,
    } = options;

    return {
      colId: 'actions',
      headerName,
      width,
      maxWidth: width,
      sortable: false,
      filter: false,
      pinned: 'right',
      suppressHeaderMenuButton: true,
      cellRenderer,
      cellRendererParams,
      onCellClicked,
    };
  }

  fromFields(
    fields: (keyof TData & string)[],
    overrides?: Partial<ColDef<TData>>,
  ): ColDef<TData>[] {
    return fields.map((field) => this.text({ field, extra: overrides }));
  }

  private toHeaderName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  }
}

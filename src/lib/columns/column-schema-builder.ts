import type { ColDef, ColGroupDef } from 'ag-grid-community';
import type { ColumnDefinitionFactory } from '../core/column-definition.factory';
import type { RowData } from '../models/ag-grid.types';
import type {
  ColumnGroupSchema,
  ColumnSchema,
  FieldPipeline,
  FieldPipelineMap,
} from './column-schema.types';
import {
  booleanValueSetter,
  moneyCentsValueGetter,
  moneyCentsValueParser,
  moneyCentsValueSetter,
  moneyDisplayFormatter,
  percentDisplayFormatter,
  percentValueParser,
} from './value-setters';

/**
 * Builds {@link ColDef} arrays from declarative {@link ColumnSchema}.
 * Kind defaults + optional named pipelines + per-column `extra`.
 */
export class ColumnSchemaBuilder<TData extends RowData = RowData> {
  constructor(private readonly factory: ColumnDefinitionFactory<TData>) {}

  /**
   * @param schema One entry per column
   * @param customPipelines Business-specific getters/setters (registered once per grid)
   */
  build<TFields, TPipeline extends string = string>(
    schema: readonly ColumnSchema<TFields, TPipeline>[],
    customPipelines: FieldPipelineMap<TData, TPipeline> = {},
  ): ColDef<TData>[] {
    return schema.map((col) => this.toColDef(col, customPipelines));
  }

  /**
   * Build column groups — each group has a parent header and child columns.
   * Use for complex tables with "Pricing", "Inventory", "Compliance" sections.
   */
  buildGroups<TFields, TPipeline extends string = string>(
    groups: readonly ColumnGroupSchema<TFields, TPipeline>[],
    customPipelines: FieldPipelineMap<TData, TPipeline> = {},
  ): ColGroupDef<TData>[] {
    return groups.map((group) => ({
      groupId: group.groupId,
      headerName: group.headerName,
      marryChildren: group.marryChildren,
      children: group.children.map((col) =>
        this.toColDef(col, customPipelines),
      ),
    }));
  }

  private toColDef<TFields, TPipeline extends string>(
    col: ColumnSchema<TFields, TPipeline>,
    customPipelines: FieldPipelineMap<TData, TPipeline>,
  ): ColDef<TData> {
    const field = (col.field ?? col.colId ?? 'unknown') as keyof TData & string;
    let def = this.baseFromKind(col, field);
    if (col.colId) {
      def = { ...def, colId: col.colId, field: undefined };
    }
    const pipeline = col.pipeline
      ? customPipelines[col.pipeline]
      : undefined;
    if (pipeline) {
      def = this.mergePipeline(def, pipeline);
    }
    if (col.extra) {
      def = { ...def, ...col.extra } as ColDef<TData>;
    }
    return def;
  }

  private baseFromKind<TFields, TPipeline extends string>(
    col: ColumnSchema<TFields, TPipeline>,
    field: keyof TData & string,
  ): ColDef<TData> {
    const headerName = col.headerName;
    const flex = col.flex;
    const minWidth = col.minWidth;
    const pinned = col.pinned;
    const validate = col.validate;
    const editable = col.editable;
    const sortable = col.sortable;
    const filter = col.filter;

    switch (col.kind) {
      case 'boolean':
        return this.mergePipeline(this.factory.boolean(field), {
          editable: editable ?? true,
          valueSetter: booleanValueSetter<TData, Record<string, unknown>>(field),
        });

      case 'money':
        return this.mergePipeline(
          this.factory.number(field, {
            validate,
            headerName,
            flex,
            minWidth,
            pinned,
            sortable,
            filter: filter ?? 'agNumberColumnFilter',
            editable: editable ?? false,
          }),
          {
            valueGetter: moneyCentsValueGetter<TData>(field),
            valueParser: moneyCentsValueParser(),
            valueSetter: moneyCentsValueSetter<TData>(field),
            valueFormatter: moneyDisplayFormatter(),
          },
        );

      case 'percent':
        return this.mergePipeline(
          this.factory.number(field, {
            validate,
            headerName,
            flex,
            minWidth,
            pinned,
            sortable,
            filter,
            editable: editable ?? false,
          }),
          {
            valueParser: percentValueParser(),
            valueFormatter: percentDisplayFormatter(),
          },
        );

      case 'number':
        return this.factory.number(field, {
          validate,
          headerName,
          flex,
          minWidth,
          pinned,
          sortable,
          filter,
          editable,
        });

      case 'date':
        return this.factory.date(field, {
          validate,
          editable,
          headerName,
          flex,
          minWidth,
          pinned,
          sortable,
          filter: filter as never,
        });

      case 'enum':
        return this.factory.text({
          field,
          headerName,
          flex,
          minWidth,
          pinned,
          validate,
          filter: filter ?? 'agSetColumnFilter',
          extra: {
            editable,
            sortable,
            filterParams: col.enumValues
              ? { values: [...col.enumValues] }
              : undefined,
          },
        });

      case 'computed':
        return this.factory.text({
          field,
          headerName,
          flex,
          minWidth,
          pinned,
          extra: {
            editable: false,
            sortable: sortable ?? false,
            filter: filter ?? false,
          },
        });

      case 'text':
      default:
        return this.factory.text({
          field,
          headerName,
          flex,
          minWidth,
          pinned,
          validate,
          sortable,
          filter,
          extra: { editable },
        });
    }
  }

  private mergePipeline(
    def: ColDef<TData>,
    pipeline: FieldPipeline<TData>,
  ): ColDef<TData> {
    return { ...def, ...pipeline };
  }
}

import { Injectable, inject } from '@angular/core';
import type {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  IDatasource,
} from 'ag-grid-community';
import { AgGridBase, ColumnSchemaBuilder } from '@app/ag-grid-common';
import { PRODUCT_COLUMN_GROUPS } from '@app/ag-grid-examples/product-columns.schema.example';
import {
  PRODUCT_DEPENDENT_COLUMNS,
  PRODUCT_PIPELINES,
} from '@app/ag-grid-examples/product-pipelines.example';
import { ProductsApiService } from './api/products-api.service';
import type { ProductRow } from './product-row.model';

/**
 * Live demo — complex server-driven grid (~30 cols, column groups, pipelines).
 * Mirrors complex-product-server-grid.service.example.ts
 */
@Injectable()
export class ProductsServerGridService extends AgGridBase<ProductRow> {
  private readonly productsApi = inject(ProductsApiService);
  private readonly schemaBuilder = new ColumnSchemaBuilder<ProductRow>(this.columns);

  constructor() {
    super({
      id: 'products-server-grid',
      serverSideCacheBlockSize: 50,
      gridOptions: {
        cacheBlockSize: 50,
        maxBlocksInCache: 10,
        infiniteInitialRowCount: 50,
        maxConcurrentDatasourceRequests: 1,
      },
    });
  }

  protected override getDefaultGridOptions(): GridOptions<ProductRow> {
    return {
      ...super.getDefaultGridOptions(),
      getRowId: (p) => p.data.id,
      onCellValueChanged: (e) => this.onCellPersist(e),
    };
  }

  protected override createInfiniteDatasource(): IDatasource {
    return {
      getRows: (params) => {
        this.productsApi
          .getPage({
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel,
          })
          .subscribe({
            next: (res) => params.successCallback(res.items, res.total),
            error: () => params.failCallback(),
          });
      },
    };
  }

  protected override buildColumnDefs(): ColDef<ProductRow>[] {
    return [
      ...this.schemaBuilder.buildGroups(PRODUCT_COLUMN_GROUPS, PRODUCT_PIPELINES),
      this.columns.actions({
        headerName: '⋯',
        width: 72,
        onCellClicked: (e) => {
          if (e.data) console.log('Open product', e.data.id);
        },
      }),
    ];
  }

  refresh(): void {
    this.refreshInfiniteCache();
  }

  private onCellPersist(e: CellValueChangedEvent<ProductRow>): void {
    const field = e.colDef.field;
    if (!field || !e.data || e.oldValue === e.newValue) return;

    this.productsApi.update(e.data.id, { [field]: e.data[field] }).subscribe({
      error: () => {
        e.data[field] = e.oldValue;
        e.api.refreshCells({
          rowNodes: [e.node!],
          columns: [field],
          force: true,
        });
      },
    });

    const dependent = PRODUCT_DEPENDENT_COLUMNS[field] ?? [];
    if (dependent.length) {
      e.api.refreshCells({
        rowNodes: [e.node!],
        columns: dependent,
        force: true,
      });
    }
  }
}

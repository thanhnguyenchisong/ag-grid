import { Injectable } from '@angular/core';
import type {
  ColDef,
  GridOptions,
  IDatasource,
} from 'ag-grid-community';
import { AgGridBase } from '@app/ag-grid-common';
import type { OrderRow } from './order-row.model';
import { delay, ORDERS_MOCK_DB, queryOrdersMock } from './orders-mock.store';

/**
 * Server-driven orders grid using Infinite Row Model (AG Grid Community).
 * For full SSRM use {@link createServerSideDatasource} with AG Grid Enterprise.
 */
@Injectable()
export class OrdersServerGridService extends AgGridBase<OrderRow> {
  constructor() {
    super({
      id: 'orders-server-grid',
      serverSideCacheBlockSize: 50,
      gridOptions: {
        cacheBlockSize: 50,
        maxBlocksInCache: 10,
        infiniteInitialRowCount: 50,
        maxConcurrentDatasourceRequests: 1,
      },
    });
  }

  protected override getDefaultGridOptions(): GridOptions<OrderRow> {
    return {
      ...super.getDefaultGridOptions(),
      // Data loads via datasource — do not call setRowData in onGridReady.
      rowSelection: { mode: 'multiRow', checkboxes: true, headerCheckbox: true },
    };
  }

  protected override createInfiniteDatasource(): IDatasource {
    return {
      rowCount: ORDERS_MOCK_DB.length,
      getRows: (params) => {
        void delay(300).then(() => {
          try {
            const { rows, total } = queryOrdersMock({
              startRow: params.startRow,
              endRow: params.endRow,
              sortModel: params.sortModel,
              filterModel: params.filterModel,
            });
            params.successCallback(rows, total);
          } catch {
            params.failCallback();
          }
        });
      },
    };
  }

  protected override buildColumnDefs(): ColDef<OrderRow>[] {
    return [
      this.columns.text({ field: 'orderNo', flex: 1.2 }),
      this.columns.text({ field: 'customer', flex: 1.5 }),
      this.columns.text({
        field: 'status',
        filter: 'agSetColumnFilter',
        extra: {
          filterParams: {
            values: ['pending', 'paid', 'cancelled'],
          },
        },
      }),
      this.columns.number('total'),
      this.columns.date('createdAt'),
    ];
  }

  refresh(): void {
    this.refreshInfiniteCache();
  }
}

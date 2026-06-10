import { Injectable, inject } from '@angular/core';
import type {
  ColDef,
  GridOptions,
  IDatasource,
} from 'ag-grid-community';
import { AgGridBase } from '@app/ag-grid-common';
import { OrdersApiService } from './api/orders-api.service';
import type { OrderRow } from './order-row.model';

@Injectable()
export class OrdersServerGridService extends AgGridBase<OrderRow> {
  private readonly ordersApi = inject(OrdersApiService);

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
      rowSelection: { mode: 'multiRow', checkboxes: true, headerCheckbox: true },
    };
  }

  protected override createInfiniteDatasource(): IDatasource {
    return {
      getRows: (params) => {
        this.ordersApi
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

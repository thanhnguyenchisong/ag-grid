/**
 * COPY when using AG Grid Enterprise — SSRM for large / server-filtered tables.
 *
 * Setup (once per app):
 * 1. npm install ag-grid-enterprise
 * 2. main.ts: LicenseManager.setLicenseKey('YOUR_KEY')
 * 3. app.config.ts: provideAgGrid({ enterpriseModules: [AllEnterpriseModule], ... })
 *
 * Not exported from the library; reference only.
 */
import { Injectable } from '@angular/core';
import type { ColDef, IServerSideDatasource } from 'ag-grid-community';
import { AgGridBase } from '../core/ag-grid-base';

export interface OrderRow {
  id: string;
  orderNo: string;
  customer: string;
  status: string;
  total: number;
  createdAt: string;
  [key: string]: unknown;
}

// @Injectable()
export class OrdersSsrmGridService extends AgGridBase<OrderRow> {
  // private readonly ordersApi = inject(OrdersApi);

  constructor() {
    super({
      id: 'orders-ssrm-grid',
      serverSideCacheBlockSize: 50,
      gridOptions: {
        pagination: true,
        paginationPageSize: 20,
      },
    });
  }

  protected override createServerSideDatasource(): IServerSideDatasource<OrderRow> {
    return {
      getRows: (params) => {
        // this.ordersApi.query(mapRequest(params.request)).subscribe({
        //   next: (res) =>
        //     params.success({ rowData: res.rows, rowCount: res.total }),
        //   error: () => params.fail(),
        // });
        params.success({ rowData: [], rowCount: 0 });
      },
    };
  }

  protected override buildColumnDefs(): ColDef<OrderRow>[] {
    return [
      this.columns.text({ field: 'orderNo' }),
      this.columns.text({ field: 'customer', flex: 2 }),
      this.columns.number('total'),
      this.columns.date('createdAt'),
    ];
  }

  refresh(): void {
    this.refreshServerSide({ purge: true });
  }
}

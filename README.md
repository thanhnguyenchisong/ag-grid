# AG Grid Common (Angular 20)

One reusable **`AgGridBase`** class and **`AgGridTableComponent`** for every feature that needs a table.

**Kế hoạch ý tưởng chi tiết (tiếng Việt):** [docs/PLAN-AG-GRID-COMMON.md](docs/PLAN-AG-GRID-COMMON.md)

**Hướng dẫn học AG Grid từ zero → master (tiếng Việt):** [docs/HUONG-DAN-AG-GRID-ANGULAR.md](docs/HUONG-DAN-AG-GRID-ANGULAR.md)

**Reference implementation:** [projects/demo/src/app/](projects/demo/src/app/) — `UsersGridService` + toolbar + `AgGridTableComponent`

---

## Architecture

Three layers — each table in your app only implements the **feature** layer:

```
App (once)          →  provideAgGrid(), theme CSS, defaultColDef
Common (library)    →  AgGridBase, AgGridTableComponent, ColumnDefinitionFactory
Feature (per table) →  OrdersGridService, UsersGridService, ProductsGridService …
```

| Layer | You configure | You do **not** configure |
|-------|---------------|--------------------------|
| **App** | Theme, global `gridOptions`, default height | Per-table columns or API calls |
| **Common** | (import library) | Business logic |
| **Feature** | Columns, load data, buttons/actions | Raw `ag-grid-angular` markup |

**Rule:** one feature service extends `AgGridBase` per table. Multiple tables = multiple services.

---

## Setup in your Angular 20 app

### 1. Install dependencies

```bash
npm install ag-grid-community ag-grid-angular
```

Peer dependencies required by this library: `@angular/core` ^20, `@angular/common` ^20, `rxjs` ^7.8.

### 2. AG Grid styles

In `angular.json` or `styles.scss`:

```scss
@use 'ag-grid-community/styles/ag-grid.css';
@use 'ag-grid-community/styles/ag-theme-quartz.css';
```

### 3. Register modules + app-wide defaults

In `app.config.ts`:

```typescript
import { type ApplicationConfig } from '@angular/core';
import { provideAgGrid } from '@app/ag-grid-common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgGrid({
      defaults: {
        themeClass: 'ag-theme-quartz',
        defaultHeight: '480px',
        gridOptions: {
          defaultColDef: { sortable: true, filter: true, resizable: true },
        },
      },
    }),
  ],
};
```

`provideAgGrid()` registers AG Grid community modules and optional app-wide defaults. Use `provideAgGridDefaults()` alone if you register modules yourself.

### 4. Link the library

**Consumer app** — point to the built package (run `npm run build:lib` in this repo first):

```json
{
  "compilerOptions": {
    "paths": {
      "@app/ag-grid-common": ["../ag-grid/dist"]
    }
  }
}
```

**This repo (dev)** — `tsconfig.json` already maps `@app/ag-grid-common` → `src/public-api.ts`, so `npm start` works without building the library.

---

## Recipe: new table in 5 steps

1. **Define a row interface** — add `[key: string]: unknown` for `RowData` compatibility.
2. **Create `XxxGridService extends AgGridBase<XxxRow>`** — pass per-table config in `super({ ... })`.
3. **Override `buildColumnDefs()`** — declare columns with `this.columns.*`.
4. **Override `onGridReady()`** — load data on first render.
5. **Wire in a component** — `providers: [XxxGridService]` + `<app-ag-grid-table [grid]="grid" />`.

---

## Example: Orders table

### Grid service (`features/orders/orders-grid.service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import type { ColDef } from 'ag-grid-community';
import { AgGridBase } from '@app/ag-grid-common';

export interface OrderRow {
  orderNo: string;
  createdAt: string;
  total: number;
  [key: string]: unknown;
}

@Injectable()
export class OrdersGridService extends AgGridBase<OrderRow> {
  private readonly api = inject(OrdersApi);

  constructor() {
    super({ id: 'orders-grid', paginationPageSize: 25 });
  }

  protected override buildColumnDefs(): ColDef<OrderRow>[] {
    return [
      this.columns.text({ field: 'orderNo', flex: 2 }),
      this.columns.date('createdAt'),
      this.columns.number('total'),
    ];
  }

  protected override onGridReady(): void {
    this.reload();
  }

  reload(): void {
    this.showLoading();
    this.api.getAll().subscribe({
      next: (rows) => {
        this.setRowData(rows);
        this.hideLoading();
      },
      error: () => this.hideLoading(),
    });
  }
}
```

### Page component (`features/orders/orders-page.component.ts`)

```typescript
import { Component } from '@angular/core';
import { AgGridTableComponent } from '@app/ag-grid-common';
import { OrdersGridService } from './orders-grid.service';

@Component({
  standalone: true,
  imports: [AgGridTableComponent],
  providers: [OrdersGridService],
  template: `
    <button type="button" (click)="grid.reload()">Refresh</button>
    <button type="button" (click)="grid.exportCsv('orders.csv')">Export</button>
    <app-ag-grid-table [grid]="grid" height="500px" />
  `,
})
export class OrdersPageComponent {
  constructor(readonly grid: OrdersGridService) {}
}
```

---

## Column customization

Use `this.columns` inside `buildColumnDefs()`:

| Method | Usage | When to use |
|--------|-------|-------------|
| `text({ field, headerName, flex, extra })` | `this.columns.text({ field: 'name', flex: 2 })` | Text columns; pass raw `ColDef` overrides via `extra` |
| `number(field, overrides?)` | `this.columns.number('total')` | Numeric filter + formatter |
| `date(field, overrides?)` | `this.columns.date('createdAt')` | Date filter + locale formatter |
| `checkbox(overrides?)` | `this.columns.checkbox()` | Legacy checkbox selection column |
| `actions({ cellRenderer, onCellClicked })` | See below | Edit / Delete buttons |
| `fromFields(['a','b'])` | `this.columns.fromFields(['sku', 'qty'])` | Quick tables with default text columns |

**Custom cell renderer** via `extra`:

```typescript
this.columns.text({
  field: 'status',
  extra: {
    cellRenderer: (params) => `<span class="badge">${params.value}</span>`,
  },
});
```

**Actions column:**

```typescript
this.columns.actions({
  width: 100,
  onCellClicked: (event) => {
    if (event.colDef.colId === 'actions') {
      this.editRow(event.data);
    }
  },
});
```

---

## Per-table options

Pass config in `super({ ... })` or override `getDefaultGridOptions()`:

```typescript
import type { GridOptions } from 'ag-grid-community';

super({
  id: 'orders-grid',
  paginationPageSize: 25,
  rowSelection: { mode: 'singleRow' },
  context: { canEdit: true },
  gridOptions: { domLayout: 'autoHeight' },
  hooks: {
    afterGridReady: (api) => console.log('ready', api),
    onRowDataChanged: (rows) => console.log(rows.length),
  },
});
```

**Read-only table** — disable selection in the feature service:

```typescript
protected override getDefaultGridOptions(): GridOptions<OrderRow> {
  return {
    ...super.getDefaultGridOptions(),
    rowSelection: undefined,
  };
}
```

**Merge order** (lowest → highest priority): `provideAgGridDefaults()` → `getDefaultGridOptions()` → `super({ gridOptions })` → `buildColumnDefs()` → plugins.

---

## DI and lifecycle

| Pattern | When | Template |
|---------|------|----------|
| `providers: [XxxGridService]` on component | **Recommended** — one grid instance per page | `<app-ag-grid-table [grid]="grid" />` |
| `providedIn: 'root'` | Shared grid service across routes | `<app-ag-grid-table [grid]="grid" [autoDestroy]="false" />` |

`AgGridTableComponent` calls `grid.destroy()` on teardown by default. Set `[autoDestroy]="false"` when the service outlives the component.

Override `onDestroy()` in your grid service to unsubscribe or clean up.

---

## `AgGridBase` public API

Call these from templates, toolbar buttons, or feature methods:

| Method | Description |
|--------|-------------|
| `setRowData(rows)` | Replace all rows (client-side) |
| `getSelectedRows()` | Selected row objects |
| `selectAll()` / `deselectAll()` | Selection helpers |
| `exportCsv(fileName?)` | Download CSV |
| `showLoading()` / `hideLoading()` | Loading overlay |
| `refreshCells(force?)` | Re-render cells |
| `sizeColumnsToFit()` | Fit columns to grid width |
| `getApi()` / `requireApi()` | Access raw AG Grid API |
| `setServerSideDatasource(ds)` | Attach SSRM datasource after ready |
| `refreshServerSide(params?)` | Reload server-side blocks |

---

## Advanced customization

| Need | How |
|------|-----|
| App-wide defaults | `provideAgGrid()` or `provideAgGridDefaults()` |
| Feature columns | Override `buildColumnDefs()` |
| Feature options | Override `getDefaultGridOptions()` or `super({ gridOptions })` |
| Load data on ready | Override `onGridReady()` |
| Plugins | `this.use(plugin)` in constructor |
| Fluent config | `new GridConfigBuilder()` → `super(builder.toConfig('my-id'))` |
| Server-side rows | Override `createServerSideDatasource()` — [plan doc](docs/PLAN-AG-GRID-COMMON.md#6-server-side-row-model-tùy-chọn) |
| Shared grid service | `[autoDestroy]="false"` with `providedIn: 'root'` |

### Plugin example

```typescript
constructor() {
  super({ id: 'orders-grid' });
  this.use({
    name: 'audit',
    onGridReady: (api) => console.log('[audit] grid ready', api),
  });
}
```

### GridConfigBuilder example

```typescript
import { GridConfigBuilder } from '@app/ag-grid-common';

constructor() {
  super(
    new GridConfigBuilder<OrderRow>()
      .withPagination(25)
      .withRowSelection({ mode: 'singleRow' })
      .toConfig('orders-grid'),
  );
}
```

Override `buildColumnDefs()` for columns when using the builder — or call `.withColumnDefs([...])` in the constructor before `super()`.

---

## Reference files in this repo

| File | Purpose |
|------|---------|
| [projects/demo/src/app/users-grid.service.ts](projects/demo/src/app/users-grid.service.ts) | Working grid service with mock data |
| [projects/demo/src/app/app.component.ts](projects/demo/src/app/app.component.ts) | Toolbar + table wiring |
| [src/lib/examples/users-grid.service.example.ts](src/lib/examples/users-grid.service.example.ts) | Copy-paste template for new features |
| [src/lib/core/ag-grid-base.ts](src/lib/core/ag-grid-base.ts) | Base class implementation |

---

## Run the demo app

```bash
npm install
npm start
```

Open http://localhost:4200/ — demo uses `UsersGridService` + `AgGridTableComponent`.

## Build

```bash
npm run build        # library + demo
npm run build:lib    # library only → dist/
```

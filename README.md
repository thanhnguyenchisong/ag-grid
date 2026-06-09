# AG Grid Common (Angular 20)

Reusable **`AgGridBase`** + **`AgGridTableComponent`** for every table in your Angular app — client-side, server-driven (Community), or SSRM (Enterprise).

**Kế hoạch ý tưởng (tiếng Việt):** [docs/PLAN-AG-GRID-COMMON.md](docs/PLAN-AG-GRID-COMMON.md)

**Hướng dẫn AG Grid zero → master (tiếng Việt):** [docs/HUONG-DAN-AG-GRID-ANGULAR.md](docs/HUONG-DAN-AG-GRID-ANGULAR.md)

**Demo:** [projects/demo/src/app/](projects/demo/src/app/) — `npm start` → http://localhost:4200/

---

## Contents

- [Architecture](#architecture)
- [Setup](#setup-in-your-angular-20-app)
- [Recipe: new table](#recipe-new-table-in-5-steps)
- [Row models (per table)](#row-models-pick-per-table)
- [Examples](#examples)
- [Column customization](#column-customization)
- [Per-table options](#per-table-options)
- [DI and lifecycle](#di-and-lifecycle)
- [Public API](#aggridbase-public-api)
- [Library exports](#library-exports)
- [Advanced customization](#advanced-customization)
- [Reference files](#reference-files-in-this-repo)
- [Run demo & build](#run-the-demo-app)

---

## Architecture

```
App (once)          →  provideAgGrid(), theme CSS, defaultColDef
Common (library)    →  AgGridBase, AgGridTableComponent, ColumnDefinitionFactory
Feature (per table) →  UsersGridService, OrdersGridService, ReportsGridService …
```

| Layer | Responsibility |
|-------|----------------|
| **App** | Theme, global `gridOptions`, register Community + optional Enterprise modules |
| **Common** | Merge config, lifecycle, table shell — no business logic |
| **Feature** | Columns, load data, toolbar actions — one service per table |

**Rule:** `extends AgGridBase<RowType>` once per table. Multiple tables = multiple services.

---

## Setup in your Angular 20 app

### 1. Install

```bash
npm install ag-grid-community ag-grid-angular
# Optional — only if any table uses Enterprise (SSRM, grouping, Excel export…)
npm install ag-grid-enterprise
```

Peer deps: `@angular/core` ^20, `@angular/common` ^20, `rxjs` ^7.8. `ag-grid-enterprise` is optional.

### 2. Styles

```scss
// styles.scss or angular.json
@use 'ag-grid-community/styles/ag-grid.css';
@use 'ag-grid-community/styles/ag-theme-quartz.css';
// Import other themes if used per-table (e.g. ag-theme-alpine.css)
```

### 3. App config — Community only

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

### 4. App config — mixed Community + Enterprise

Some tables use Enterprise, others stay Community. Register Enterprise **once** for the whole app:

```typescript
// main.ts — BEFORE bootstrapApplication
import { LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey('YOUR_LICENSE_KEY');

// app.config.ts
import { type ApplicationConfig } from '@angular/core';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { provideAgGrid } from '@app/ag-grid-common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgGrid({
      enterpriseModules: [AllEnterpriseModule],
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

Alternative — register Enterprise manually in `main.ts`:

```typescript
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
```

Or use `registerAgGridEnterpriseModules(AllEnterpriseModule)` from `@app/ag-grid-common` after Community modules are registered.

### 5. Link this library

**Consumer app** (build library first: `npm run build:lib`):

```json
{
  "compilerOptions": {
    "paths": {
      "@app/ag-grid-common": ["../ag-grid/dist"]
    }
  }
}
```

**This repo (dev):** `tsconfig.json` maps `@app/ag-grid-common` → `src/public-api.ts` — `npm start` works without building the library.

---

## Recipe: new table in 5 steps

1. **Row interface** — include `[key: string]: unknown` for `RowData` compatibility.
2. **`XxxGridService extends AgGridBase<XxxRow>`** — config in `super({ ... })`.
3. **`buildColumnDefs()`** — columns via `this.columns.*`.
4. **Load data** — pick one:
   - Client-side → `onGridReady()` + `setRowData()`
   - Server-driven → `createInfiniteDatasource()` (Community)
   - SSRM → `createServerSideDatasource()` (Enterprise)
5. **Component** — `providers: [XxxGridService]` + `<app-ag-grid-table [grid]="grid" />`.

---

## Row models: pick per table

| Need | Override | Edition | Load data |
|------|----------|---------|-----------|
| Small/medium lists | *(default)* | Community | `setRowData()` in `onGridReady()` |
| Large lists, lazy blocks | `createInfiniteDatasource()` | Community | `successCallback(rows, lastRow)` |
| SSRM, server grouping/pivot | `createServerSideDatasource()` | **Enterprise** | `params.success({ rowData, rowCount })` |

**Priority:** if both `createServerSideDatasource()` and `createInfiniteDatasource()` return a datasource, **SSRM wins**.

| | Client-side | Infinite (Community) | SSRM (Enterprise) |
|---|-------------|----------------------|-------------------|
| **When** | &lt; few thousand rows | Large data, basic server sort/filter | Full server-side features |
| **Do not** | `setRowData` on huge datasets | Expect row grouping on server | Use without license |
| **Refresh** | `reload()` → `setRowData` | `refreshInfiniteCache()` | `refreshServerSide({ purge: true })` |

---

## Examples

### Client-side (default)

```typescript
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
      next: (rows) => { this.setRowData(rows); this.hideLoading(); },
      error: () => this.hideLoading(),
    });
  }
}
```

### Page component

```typescript
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

### Server-driven — Infinite Row Model (Community)

Do **not** call `setRowData()` in `onGridReady`. See demo: [orders-server-grid.service.ts](projects/demo/src/app/orders-server-grid.service.ts).

```typescript
protected override createInfiniteDatasource(): IDatasource {
  return {
    rowCount: TOTAL_ROWS, // optional — known dataset size
    getRows: (params) => {
      this.api.fetchBlock(params.startRow, params.endRow, params.sortModel, params.filterModel)
        .subscribe({
          next: ({ rows, total }) => params.successCallback(rows, total),
          error: () => params.failCallback(),
        });
    },
  };
}

refresh(): void {
  this.refreshInfiniteCache();
}
```

### SSRM (Enterprise)

Template: [orders-ssrm-grid.service.example.ts](src/lib/examples/orders-ssrm-grid.service.example.ts).

```typescript
protected override createServerSideDatasource(): IServerSideDatasource<OrderRow> {
  return {
    getRows: (params) => {
      this.api.query(params.request).subscribe({
        next: (res) =>
          params.success({ rowData: res.rows, rowCount: res.total }),
        error: () => params.fail(),
      });
    },
  };
}

refresh(): void {
  this.refreshServerSide({ purge: true });
}
```

---

## Field validation (yellow `!` warning)

Per-column validator on `text()`, `number()`, or `date()` — invalid cells get a **yellow background** and **`!` badge** (hover for message). Works while displaying and during inline edit.

```typescript
import { email, combine, required } from '@app/ag-grid-common';

this.columns.text({
  field: 'email',
  validate: combine(required<UserRow>(), email<UserRow>()),
  extra: { editable: true },
});
```

Built-in validators: `required`, `email`, `minLength`, `minValue`, `combine`. Custom:

```typescript
validate: (value, row) =>
  String(value).startsWith('ORD-') ? null : 'Must start with ORD-',
```

After edit, refresh the cell so the badge updates:

```typescript
onCellValueChanged: (e) => {
  const field = e.colDef.field;
  if (field && e.node) {
    e.api.refreshCells({ rowNodes: [e.node], columns: [field], force: true });
  }
},
```

Low-level: `applyFieldValidation(colDef, validator)` from `@app/ag-grid-common`.

---

## Column customization

| Method | Example | Notes |
|--------|---------|-------|
| `text({ field, flex, validate, extra })` | `this.columns.text({ field: 'email', validate: email() })` | `validate` → yellow `!` when invalid |
| `number(field)` | `this.columns.number('total')` | Number filter |
| `date(field)` | `this.columns.date('createdAt')` | Date filter |
| `checkbox()` | `this.columns.checkbox()` | Selection column |
| `actions({ onCellClicked })` | Edit / Delete column | Pinned right |
| `fromFields(['a','b'])` | Auto text columns | Quick tables |

```typescript
// Custom renderer
this.columns.text({
  field: 'status',
  extra: { cellRenderer: (p) => `<span>${p.value}</span>` },
});

// Set filter (pass filterParams via extra)
this.columns.text({
  field: 'status',
  filter: 'agSetColumnFilter',
  extra: { filterParams: { values: ['pending', 'paid'] } },
});
```

---

## Per-table options

### Constructor config

```typescript
super({
  id: 'orders-grid',
  paginationPageSize: 25,
  serverSideCacheBlockSize: 50, // block size for Infinite / SSRM
  rowSelection: { mode: 'singleRow' },
  context: { canEdit: true },
  gridOptions: { domLayout: 'autoHeight' },
  hooks: {
    afterGridReady: (api) => console.log('ready', api),
    onRowDataChanged: (rows) => console.log(rows.length),
  },
});
```

### Theme per table

App default comes from `provideAgGrid({ defaults: { themeClass } })`. Override in a single grid service:

```typescript
override get themeClass(): string {
  return 'ag-theme-alpine';
}
```

Import the matching CSS in `styles.scss` (e.g. `ag-theme-alpine.css`).

### Read-only table

```typescript
protected override getDefaultGridOptions(): GridOptions<OrderRow> {
  return { ...super.getDefaultGridOptions(), rowSelection: undefined };
}
```

### Config merge order (low → high)

`provideAgGridDefaults()` → `getDefaultGridOptions()` → `super({ gridOptions })` → `buildColumnDefs()` → plugins → remote row model datasource.

---

## DI and lifecycle

| Pattern | When | Template |
|---------|------|----------|
| `providers: [XxxGridService]` on component | **Recommended** | `<app-ag-grid-table [grid]="grid" />` |
| `providedIn: 'root'` | Shared across routes | `<app-ag-grid-table [autoDestroy]="false" />` |

`AgGridTableComponent` calls `grid.destroy()` on teardown by default. Override `onDestroy()` in the grid service to unsubscribe.

---

## `AgGridBase` public API

| Method | Use |
|--------|-----|
| `setRowData(rows)` | Client-side data |
| `getSelectedRows()` | Selection |
| `selectAll()` / `deselectAll()` | Bulk selection |
| `exportCsv(fileName?)` | CSV export |
| `showLoading()` / `hideLoading()` | Loading overlay |
| `refreshCells(force?)` | Re-render |
| `sizeColumnsToFit()` | Auto-fit columns |
| `getApi()` / `requireApi()` | Raw AG Grid API |
| `refreshInfiniteCache()` | Reload Infinite model (Community) |
| `refreshServerSide(params?)` | Reload SSRM (Enterprise) |
| `setServerSideDatasource(ds)` | Swap SSRM datasource after ready |

---

## Library exports

```typescript
import {
  AgGridBase,
  AgGridTableComponent,
  ColumnDefinitionFactory,
  GridConfigBuilder,
  provideAgGrid,
  provideAgGridDefaults,
  registerAgGridEnterpriseModules,
} from '@app/ag-grid-common';

import type {
  AgGridConfig,
  GridPlugin,
  IDatasource,
  IGetRowsParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from '@app/ag-grid-common';
```

---

## Advanced customization

| Need | How |
|------|-----|
| App defaults | `provideAgGrid()` / `provideAgGridDefaults()` |
| Enterprise modules | `provideAgGrid({ enterpriseModules: [AllEnterpriseModule] })` |
| Columns | Override `buildColumnDefs()` |
| Grid options | Override `getDefaultGridOptions()` or `super({ gridOptions })` |
| Plugins | `this.use(plugin)` in constructor |
| Fluent config | `new GridConfigBuilder<T>().withPagination(25).toConfig('id')` |
| Shared service | `[autoDestroy]="false"` |

```typescript
// Plugin
this.use({
  name: 'audit',
  onGridReady: (api) => console.log('[audit]', api),
});
```

More detail: [docs/PLAN-AG-GRID-COMMON.md](docs/PLAN-AG-GRID-COMMON.md)

---

## Reference files in this repo

| File | Pattern |
|------|---------|
| [users-grid.service.ts](projects/demo/src/app/users-grid.service.ts) | Client-side + `setRowData()` |
| [orders-server-grid.service.ts](projects/demo/src/app/orders-server-grid.service.ts) | Infinite / Community |
| [orders-mock.store.ts](projects/demo/src/app/orders-mock.store.ts) | Mock API (sort, filter, blocks) |
| [orders-ssrm-grid.service.example.ts](src/lib/examples/orders-ssrm-grid.service.example.ts) | SSRM / Enterprise template |
| [users-grid.service.example.ts](src/lib/examples/users-grid.service.example.ts) | Copy-paste starter |
| [ag-grid-base.ts](src/lib/core/ag-grid-base.ts) | Base class source |

---

## Run the demo app

```bash
npm install
npm start
```

Open http://localhost:4200/ — two tabs:

| Tab | Service | Pattern |
|-----|---------|---------|
| **Client-side (Users)** | `UsersGridService` | `setRowData()` + client pagination |
| **Server-driven (Orders)** | `OrdersServerGridService` | `createInfiniteDatasource()` — 500 mock rows |

> SSRM (`createServerSideDatasource`) requires **AG Grid Enterprise** + license. The Orders demo uses **Infinite Row Model** (Community) with the same server-driven loading pattern.

## Build

```bash
npm run build        # library → dist/ + demo → dist/demo/
npm run build:lib    # library only
npm run build:demo   # demo only
```

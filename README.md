# AG Grid Common (Angular 20)

One reusable **`AgGridBase`** class and **`AgGridTableComponent`** for every feature that needs a table.

**Kế hoạch ý tưởng chi tiết (tiếng Việt):** [docs/PLAN-AG-GRID-COMMON.md](docs/PLAN-AG-GRID-COMMON.md)

**Hướng dẫn học AG Grid từ zero → master (tiếng Việt):** [docs/HUONG-DAN-AG-GRID-ANGULAR.md](docs/HUONG-DAN-AG-GRID-ANGULAR.md)

## Setup in your Angular 20 app

```bash
npm install ag-grid-community ag-grid-angular
```

In `angular.json` or `styles.scss`:

```scss
@use 'ag-grid-community/styles/ag-grid.css';
@use 'ag-grid-community/styles/ag-theme-quartz.css';
```

In `app.config.ts`:

```typescript
import { provideAgGridDefaults } from '@app/ag-grid-common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgGridDefaults({
      themeClass: 'ag-theme-quartz',
      defaultHeight: '480px',
      gridOptions: {
        defaultColDef: { sortable: true, filter: true, resizable: true },
      },
    }),
  ],
};
```

Link this library via path in `tsconfig.json`:

```json
{
  "paths": {
    "@app/ag-grid-common": ["../ag-grid/dist"]
  }
}
```

## 1. Create a grid per feature (extend `AgGridBase`)

```typescript
// features/orders/orders-grid.service.ts
@Injectable()
export class OrdersGridService extends AgGridBase<OrderRow> {
  private readonly api = inject(OrdersApi);

  constructor() {
    super({ id: 'orders-grid', paginationPageSize: 25 });
  }

  protected override buildColumnDefs(): ColDef<OrderRow>[] {
    return [
      this.columns.text({ field: 'orderNo' }),
      this.columns.date({ field: 'createdAt' }),
      this.columns.number({ field: 'total' }),
    ];
  }

  protected override onGridReady(): void {
    this.reload();
  }

  reload(): void {
    this.showLoading();
    this.api.getAll().subscribe((rows) => {
      this.setRowData(rows);
      this.hideLoading();
    });
  }
}
```

## 2. Use the shared table component

```typescript
@Component({
  standalone: true,
  imports: [AgGridTableComponent],
  template: `
    <button (click)="grid.reload()">Refresh</button>
    <button (click)="grid.exportCsv('orders.csv')">Export</button>
    <app-ag-grid-table [grid]="grid" height="500px" />
  `,
})
export class OrdersPageComponent {
  readonly grid = inject(OrdersGridService);
}
```

## Extending further

| Need | How |
|------|-----|
| App-wide defaults | `provideAgGridDefaults()` |
| Feature columns | Override `buildColumnDefs()` |
| Feature options | Override `getDefaultGridOptions()` or pass `super({ gridOptions: { ... } })` |
| Load data on ready | Override `onGridReady()` |
| Plugins (export rules, etc.) | `this.use(myPlugin)` in constructor |
| Fluent config | `GridConfigBuilder` → `super(builder.toConfig())` |
| Server-side rows | Override `createServerSideDatasource()` — see [plan doc](docs/PLAN-AG-GRID-COMMON.md#6-server-side-row-model-tùy-chọn) |

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

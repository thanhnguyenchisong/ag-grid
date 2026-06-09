import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AgGridTableComponent } from '@app/ag-grid-common';
import { OrdersServerGridService } from './orders-server-grid.service';
import { UsersGridService } from './users-grid.service';

type DemoTab = 'client' | 'server';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridTableComponent],
  providers: [UsersGridService, OrdersServerGridService],
  template: `
    <main class="demo">
      <header class="demo__header">
        <h1>AG Grid Common — Demo</h1>
        <p>
          Reusable <code>AgGridBase</code> + <code>AgGridTableComponent</code>
          for client-side and server-side tables.
        </p>
      </header>

      <nav class="demo__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          [class.demo__tab--active]="activeTab() === 'client'"
          [attr.aria-selected]="activeTab() === 'client'"
          (click)="activeTab.set('client')"
        >
          Client-side (Users)
        </button>
        <button
          type="button"
          role="tab"
          [class.demo__tab--active]="activeTab() === 'server'"
          [attr.aria-selected]="activeTab() === 'server'"
          (click)="activeTab.set('server')"
        >
          Server-driven (Orders)
        </button>
      </nav>

      <section
        class="demo__panel"
        role="tabpanel"
        [hidden]="activeTab() !== 'client'"
      >
        <p class="demo__hint">
          All rows loaded with <code>setRowData()</code> — sort, filter, and
          pagination run on the client.
        </p>
        <section class="demo__toolbar">
          <button type="button" (click)="usersGrid.loadUsers()">Refresh</button>
          <button type="button" (click)="usersGrid.exportCsv('users.csv')">
            Export CSV
          </button>
          <button type="button" (click)="usersGrid.deleteSelected()">
            Delete selected
          </button>
        </section>
        <app-ag-grid-table [grid]="usersGrid" height="500px" />
      </section>

      <section
        class="demo__panel"
        role="tabpanel"
        [hidden]="activeTab() !== 'server'"
      >
        <p class="demo__hint">
          500 orders in mock DB — <code>createInfiniteDatasource()</code>
          (Community) simulates API with 300ms delay. Scroll to load more blocks;
          sort and filter are server-driven. Full SSRM requires AG Grid
          Enterprise.
        </p>
        <section class="demo__toolbar">
          <button type="button" (click)="ordersGrid.refresh()">Refresh</button>
          <button type="button" (click)="ordersGrid.exportCsv('orders.csv')">
            Export CSV
          </button>
          <button type="button" (click)="logOrdersSelection()">
            Log selected (console)
          </button>
        </section>
        <app-ag-grid-table [grid]="ordersGrid" height="500px" />
      </section>
    </main>
  `,
  styles: [
    `
      .demo {
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.5rem;
      }
      .demo__header h1 {
        margin: 0 0 0.25rem;
        font-size: 1.5rem;
      }
      .demo__header p {
        margin: 0 0 1rem;
        color: #555;
      }
      .demo__tabs {
        display: flex;
        gap: 0.25rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #ddd;
      }
      .demo__tabs button {
        padding: 0.5rem 1rem;
        border: none;
        border-bottom: 2px solid transparent;
        background: transparent;
        cursor: pointer;
        color: #555;
        margin-bottom: -1px;
      }
      .demo__tabs button:hover {
        color: #111;
      }
      .demo__tab--active {
        color: #111 !important;
        border-bottom-color: #2563eb !important;
        font-weight: 600;
      }
      .demo__hint {
        margin: 0 0 0.75rem;
        font-size: 0.9rem;
        color: #666;
      }
      .demo__toolbar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .demo__toolbar button {
        padding: 0.4rem 0.85rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
      }
      .demo__toolbar button:hover {
        background: #f0f0f0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly activeTab = signal<DemoTab>('client');

  constructor(
    readonly usersGrid: UsersGridService,
    readonly ordersGrid: OrdersServerGridService,
  ) {}

  logOrdersSelection(): void {
    console.log('Selected orders:', this.ordersGrid.getSelectedRows());
  }
}

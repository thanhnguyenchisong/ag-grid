import { Component, inject } from '@angular/core';
import { AgGridTableComponent } from '@app/ag-grid-common';
import { UsersGridService } from './users-grid.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridTableComponent],
  template: `
    <main class="page">
      <header class="page__header">
        <h1>AG Grid Demo</h1>
        <div class="page__actions">
          <button type="button" (click)="grid.loadUsers()">Refresh</button>
          <button type="button" (click)="grid.exportCsv('users.csv')">
            Export CSV
          </button>
        </div>
      </header>
      <app-ag-grid-table [grid]="grid" height="480px" />
    </main>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .page__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        gap: 1rem;
      }
      .page__header h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      .page__actions {
        display: flex;
        gap: 0.5rem;
      }
      button {
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class AppComponent {
  readonly grid = inject(UsersGridService);
}

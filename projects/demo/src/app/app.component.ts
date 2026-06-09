import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AgGridTableComponent } from '@app/ag-grid-common';
import { UsersGridService } from './users-grid.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridTableComponent],
  providers: [UsersGridService],
  template: `
    <main class="demo">
      <header class="demo__header">
        <h1>AG Grid Common — Demo</h1>
        <p>
          Reusable <code>AgGridBase</code> + <code>AgGridTableComponent</code>
          for any Angular 20 table.
        </p>
      </header>

      <section class="demo__toolbar">
        <button type="button" (click)="grid.loadUsers()">Refresh</button>
        <button type="button" (click)="grid.exportCsv('users.csv')">
          Export CSV
        </button>
        <button type="button" (click)="grid.deleteSelected()">
          Delete selected
        </button>
      </section>

      <app-ag-grid-table [grid]="grid" height="500px" />
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
  constructor(readonly grid: UsersGridService) {}
}

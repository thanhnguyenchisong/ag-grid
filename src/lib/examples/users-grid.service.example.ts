/**
 * COPY this pattern into your feature module — e.g. `users/users-grid.service.ts`
 *
 * Not exported from the library; reference only.
 */
import { Injectable } from '@angular/core';
import type { ColDef } from 'ag-grid-community';
import { AgGridBase } from '../core/ag-grid-base';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// @Injectable({ providedIn: 'root' }) // or providedIn: 'any' per route
export class UsersGridService extends AgGridBase<UserRow> {
  // private readonly usersApi = inject(UsersApi);

  constructor() {
    super({ id: 'users-grid', paginationPageSize: 20 });
  }

  protected override buildColumnDefs(): ColDef<UserRow>[] {
    return [
      this.columns.text({ field: 'name', flex: 2 }),
      this.columns.text({ field: 'email', flex: 2 }),
      this.columns.date({ field: 'createdAt' }),
    ];
  }

  protected override onGridReady(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.showLoading();
    // this.usersApi.getAll().subscribe({
    //   next: (rows) => {
    //     this.setRowData(rows);
    //     this.hideLoading();
    //   },
    //   error: () => this.hideLoading(),
    // });
    this.setRowData([
      { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '2025-01-01' },
    ]);
    this.hideLoading();
  }

  deleteSelected(): void {
    const selected = this.getSelectedRows();
    if (!selected.length) return;
    // this.usersApi.deleteMany(selected.map((r) => r.id)).subscribe(() => this.loadUsers());
  }
}

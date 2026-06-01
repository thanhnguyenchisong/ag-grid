import { Injectable } from '@angular/core';
import type { ColDef } from 'ag-grid-community';
import { AgGridBase } from '@app/ag-grid-common';

export interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UsersGridService extends AgGridBase<UserRow> {
  constructor() {
    super({ id: 'users-grid', paginationPageSize: 10 });
  }

  protected override buildColumnDefs(): ColDef<UserRow>[] {
    return [
      this.columns.text({ field: 'name', flex: 2 }),
      this.columns.text({ field: 'email', flex: 2 }),
      this.columns.date('createdAt'),
    ];
  }

  protected override onGridReady(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.setRowData([
      {
        id: '1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        createdAt: '2025-01-15',
      },
      {
        id: '2',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        createdAt: '2025-02-20',
      },
      {
        id: '3',
        name: 'Alan Turing',
        email: 'alan@example.com',
        createdAt: '2025-03-10',
      },
    ]);
  }
}

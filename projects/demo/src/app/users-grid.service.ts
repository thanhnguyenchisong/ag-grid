import { Injectable } from '@angular/core';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridBase, email } from '@app/ag-grid-common';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  [key: string]: unknown;
}

const MOCK_USERS: UserRow[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', createdAt: '2025-01-15' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', createdAt: '2025-02-20' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com', createdAt: '2025-03-10' },
  { id: '4', name: 'Katherine Johnson', email: 'katherine@example.com', createdAt: '2025-04-05' },
  { id: '5', name: 'Tim Berners-Lee', email: 'tim@example.com', createdAt: '2025-05-18' },
  { id: '6', name: 'Invalid Email', email: 'not-an-email', createdAt: '2025-06-01' },
];

@Injectable()
export class UsersGridService extends AgGridBase<UserRow> {
  constructor() {
    super({ id: 'users-grid', paginationPageSize: 10 });
  }

  protected override getDefaultGridOptions(): GridOptions<UserRow> {
    return {
      ...super.getDefaultGridOptions(),
      onCellValueChanged: (e) => {
        const field = e.colDef.field;
        if (!field || !e.node) return;
        e.api.refreshCells({ rowNodes: [e.node], columns: [field], force: true });
      },
    };
  }

  protected override buildColumnDefs(): ColDef<UserRow>[] {
    return [
      this.columns.text({ field: 'name', flex: 2, extra: { editable: true } }),
      this.columns.text({
        field: 'email',
        flex: 2,
        validate: email<UserRow>('Invalid email'),
        extra: { editable: true },
      }),
      this.columns.date('createdAt'),
    ];
  }

  protected override onGridReady(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.showLoading();
    this.setRowData([...MOCK_USERS]);
    this.hideLoading();
  }

  deleteSelected(): void {
    const selected = this.getSelectedRows();
    if (!selected.length) return;

    const ids = new Set(selected.map((r) => r.id));
    const remaining = MOCK_USERS.filter((u) => !ids.has(u.id));
    MOCK_USERS.length = 0;
    MOCK_USERS.push(...remaining);
    this.loadUsers();
  }

  override get themeClass(): string {
    return 'ag-theme-alpine';
  }
}

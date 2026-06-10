import { Injectable, inject } from '@angular/core';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridBase, email } from '@app/ag-grid-common';
import { UsersApiService } from './api/users-api.service';
import type { UserRow } from './user-row.model';

export type { UserRow } from './user-row.model';

@Injectable()
export class UsersGridService extends AgGridBase<UserRow> {
  private readonly usersApi = inject(UsersApiService);

  constructor() {
    super({ id: 'users-grid', paginationPageSize: 10 });
  }

  protected override getDefaultGridOptions(): GridOptions<UserRow> {
    return {
      ...super.getDefaultGridOptions(),
      onCellValueChanged: (e) => {
        const field = e.colDef.field;
        if (!field || !e.node || e.oldValue === e.newValue) return;

        const row = e.data;
        this.usersApi.update(row.id, { [field]: e.newValue }).subscribe({
          error: () => {
            row[field] = e.oldValue;
            e.api.refreshCells({
              rowNodes: [e.node!],
              columns: [field],
              force: true,
            });
          },
        });

        e.api.refreshCells({
          rowNodes: [e.node],
          columns: [field],
          force: true,
        });
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
      this.columns.boolean('isActive'),
      this.columns.date('createdAt'),
    ];
  }

  protected override onGridReady(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.showLoading();
    this.usersApi.getAll().subscribe({
      next: (rows) => {
        this.setRowData(rows);
        this.hideLoading();
      },
      error: () => this.hideLoading(),
    });
  }

  deleteSelected(): void {
    const selected = this.getSelectedRows();
    if (!selected.length) return;

    const ids = selected.map((r) => r.id);
    this.showLoading();
    this.usersApi.deleteMany(ids).subscribe({
      next: () => this.loadUsers(),
      error: () => this.hideLoading(),
    });
  }

  override get themeClass(): string {
    return 'ag-theme-alpine';
  }
}

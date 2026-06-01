import type { GridApi, GridOptions } from 'ag-grid-community';
import type { GridContext, RowData } from '../models/ag-grid.types';

export interface GridPlugin<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  readonly name: string;
  apply?(options: GridOptions<TData>): GridOptions<TData>;
  onGridReady?(api: GridApi<TData>, context: TContext | undefined): void;
  onDestroy?(): void;
}

export class PluginRegistry<
  TData extends RowData = RowData,
  TContext extends GridContext = GridContext,
> {
  private readonly plugins = new Map<string, GridPlugin<TData, TContext>>();

  register(plugin: GridPlugin<TData, TContext>): this {
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  applyAll(options: GridOptions<TData>): GridOptions<TData> {
    let result = options;
    for (const plugin of this.plugins.values()) {
      if (plugin.apply) {
        result = plugin.apply(result);
      }
    }
    return result;
  }

  notifyGridReady(api: GridApi<TData>, context: TContext | undefined): void {
    for (const plugin of this.plugins.values()) {
      plugin.onGridReady?.(api, context);
    }
  }

  notifyDestroy(): void {
    for (const plugin of this.plugins.values()) {
      plugin.onDestroy?.();
    }
  }
}

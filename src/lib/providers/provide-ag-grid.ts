import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
  type Provider,
} from '@angular/core';
import {
  AllCommunityModule,
  ModuleRegistry,
  type Module,
} from 'ag-grid-community';
import {
  AG_GRID_DEFAULTS,
  type AgGridDefaults,
} from '../tokens/ag-grid-defaults.token';

/** Register global AG Grid defaults in `app.config.ts`. */
export function provideAgGridDefaults(defaults: AgGridDefaults): Provider {
  return { provide: AG_GRID_DEFAULTS, useValue: defaults };
}

export interface ProvideAgGridOptions {
  /** App-wide grid defaults (theme, defaultColDef, height). */
  defaults?: AgGridDefaults;
  /**
   * Enterprise modules from `ag-grid-enterprise` (e.g. `[AllEnterpriseModule]`).
   * Register once per app when any grid uses Enterprise features (SSRM, grouping…).
   */
  enterpriseModules?: Module[];
}

/** Register Enterprise modules — use in `main.ts` or pass via `provideAgGrid({ enterpriseModules })`. */
export function registerAgGridEnterpriseModules(...modules: Module[]): void {
  ModuleRegistry.registerModules(modules);
}

function registerAgGridModules(enterpriseModules?: Module[]): void {
  const modules = [AllCommunityModule, ...(enterpriseModules ?? [])];
  ModuleRegistry.registerModules(modules);
}

/**
 * One-shot setup for Angular apps: registers AG Grid community modules,
 * optional enterprise modules, and app-wide defaults.
 */
export function provideAgGrid(
  options: ProvideAgGridOptions = {},
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    provideAppInitializer(() => {
      registerAgGridModules(options.enterpriseModules);
    }),
  ];

  if (options.defaults) {
    providers.push(provideAgGridDefaults(options.defaults));
  }

  return makeEnvironmentProviders(providers);
}

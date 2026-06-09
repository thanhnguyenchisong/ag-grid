import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
  type Provider,
} from '@angular/core';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
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
}

/**
 * One-shot setup for Angular apps: registers AG Grid community modules
 * and optional app-wide defaults.
 */
export function provideAgGrid(
  options: ProvideAgGridOptions = {},
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    provideAppInitializer(() => {
      ModuleRegistry.registerModules([AllCommunityModule]);
    }),
  ];

  if (options.defaults) {
    providers.push(provideAgGridDefaults(options.defaults));
  }

  return makeEnvironmentProviders(providers);
}

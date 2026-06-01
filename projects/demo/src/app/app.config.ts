import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { provideAgGridDefaults } from '@app/ag-grid-common';

ModuleRegistry.registerModules([AllCommunityModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAgGridDefaults({
      themeClass: 'ag-theme-quartz',
      defaultHeight: '480px',
      gridOptions: {
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
        },
      },
    }),
  ],
};

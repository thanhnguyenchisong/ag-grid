import { type ApplicationConfig } from '@angular/core';
import { provideAgGrid } from '@app/ag-grid-common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgGrid({
      enterpriseModules: [],
      defaults: {
        themeClass: 'ag-theme-quartz',
        defaultHeight: '480px',
        gridOptions: {
          defaultColDef: { sortable: true, filter: true, resizable: true },
        },
      },
    }),
  ],
};

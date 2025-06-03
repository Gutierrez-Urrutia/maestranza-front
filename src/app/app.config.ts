import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      TableModule,
      ButtonModule,
      TagModule,
      InputTextModule,
      DropdownModule
      
      
    )
  ]
};

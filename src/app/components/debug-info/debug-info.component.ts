import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],  template: `
    <div class="debug-info" [ngClass]="{'dev-mode': !isProduction, 'prod-mode': isProduction}">
      <small>
        <i class="bi" [ngClass]="isProduction ? 'bi-rocket' : 'bi-wrench'"></i>
        <strong>{{environmentName}}</strong>
        <br>
        <span>API: {{getHostFromUrl(apiUrl)}}</span>
        <br>
        <span>DB: {{databaseInfo}}</span>
      </small>
    </div>
  `,
  styles: [`
    .debug-info {
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 0.75rem;
      z-index: 9999;
    }
    .dev-mode {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
    .prod-mode {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #74c0fc;
    }
  `]
})
export class DebugInfoComponent {
  isProduction = environment.production;
  apiUrl = environment.apiUrl;
  environmentName = (environment as any).name || (environment.production ? 'PRODUCTION' : 'DEVELOPMENT');
  databaseInfo = this.getDatabaseInfo();

  getDatabaseInfo(): string {
    const db = (environment as any).database;
    if (db) {
      return `${db.type} (${db.host === 'localhost' ? 'Local' : db.provider || 'Remote'})`;
    }
    return environment.production ? 'Remote DB' : 'Local DB';
  }

  getHostFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.port ? ':' + urlObj.port : '');
    } catch {
      return url;
    }
  }
}

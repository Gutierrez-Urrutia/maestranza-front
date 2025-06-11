import { Component, AfterViewInit, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, NavigationStart } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CommonModule],
})
export class AppComponent implements AfterViewInit {
  title = 'maestranza-front';
  sidebarVisible = false;
  isLoginPage = true; // Siempre inicializar como true

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkLoginPage(event.url);
    });
  }

  private checkLoginPage(url: string): void {
    // Remover query params y fragments para obtener solo la ruta
    const cleanUrl = url.split('?')[0].split('#')[0];

    // Solo mostrar navbar/sidebar en rutas protegidas específicas
    this.isLoginPage = !(cleanUrl === '/inventario' ||
      cleanUrl === '/movimientos' ||
      cleanUrl === '/usuarios' ||
      cleanUrl === '/alertas');

    console.log('URL actual:', cleanUrl, 'Es login page:', this.isLoginPage);
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  ngAfterViewInit() {
    this.updateHeights();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeights();
  }

  updateHeights() {
    setTimeout(() => {
      const navbar = document.querySelector('app-navbar');
      const footer = document.querySelector('app-footer');

      if (navbar) {
        const navbarHeight = navbar.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      }

      if (footer) {
        const footerHeight = footer.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      }
    }, 0);
  }
}
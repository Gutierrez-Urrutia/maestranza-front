import { Component, AfterViewInit, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SessionService } from './services/session/session.service';
import { configureSweetAlert } from './config/swal.config';

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
  isLoginPage = true;

  constructor(
    private router: Router,
    private sessionService: SessionService 
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkLoginPage(event.url);
    });
  }

  private checkLoginPage(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    this.isLoginPage = !(cleanUrl === '/inventario' ||
      cleanUrl === '/movimientos' ||
      cleanUrl === '/usuarios' ||
      cleanUrl === '/alertas');

  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  ngAfterViewInit() {
    // Configurar SweetAlert2 con z-index máximo
    configureSweetAlert();
    
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
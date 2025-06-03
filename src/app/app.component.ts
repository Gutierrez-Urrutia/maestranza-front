import { Component, AfterViewInit, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, FooterComponent, CommonModule],
})
export class AppComponent implements AfterViewInit {
  title = 'maestranza-front';
  sidebarVisible = false;
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.url === '/' || event.url === '/login';
    });
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
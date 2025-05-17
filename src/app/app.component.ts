import { Component, AfterViewInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'maestranza-front';
  sidebarVisible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  ngAfterViewInit() {
    this.updateNavbarHeight();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateNavbarHeight();
  }

  updateNavbarHeight() {
    setTimeout(() => {
      const navbar = document.querySelector('nav.navbar');
      if (navbar) {
        const navbarHeight = navbar.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      }
    }, 0);
  }
}
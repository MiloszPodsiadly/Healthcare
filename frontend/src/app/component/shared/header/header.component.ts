import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}
  get isLoggedIn$() { return this.auth.isLoggedIn$; }

  onStartNow(): void { this.auth.toggleLogin(); }
  onProfile(): void { this.auth.openProfile(); }
  onLogout(): void { this.auth.logout(); }
}

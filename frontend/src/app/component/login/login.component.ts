import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  isLoggedIn = false;
  showLogin = false;
  expanded: boolean[] = [false, false, false, false];
  dummyList = [1, 2, 3, 4, 5];

  private readonly API = '/api';

  async ngOnInit(): Promise<void> {
    if (location.pathname === '/auth/success') {
      await this.refreshSessionState();
      this.stripPathFromUrl();
      return;
    }
    if (location.pathname === '/auth/logout') {
      this.clearUiState();
      this.stripPathFromUrl();
      return;
    }

    await this.refreshSessionState();
  }

  toggleLogin(): void {
    this.showLogin = !this.showLogin;
  }

  persistIntent(): void {
    try { localStorage.setItem('carehub_login_intent', '1'); } catch { /* no-op */ }
  }

  logout(): void {
    window.location.href = '/logout';
  }

  openProfile(): void {
    alert('Profil (demo)');
  }

  toggleSection(ix: number): void {
    this.expanded[ix] = !this.expanded[ix];
  }

  private async refreshSessionState(): Promise<void> {
    try {
      const res = await fetch(`${this.API}/me`, {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual' as RequestRedirect,
        cache: 'no-store'
      });

      if (res.status === 200) {
        this.markLoggedIn();
        return;
      }

      if (res.status === 401 || res.type === 'opaqueredirect') {
        this.clearUiState();
        return;
      }

      this.clearUiState();
    } catch {
      this.clearUiState();
    }
  }

  private markLoggedIn(): void {
    this.isLoggedIn = true;
    this.showLogin = false;
    try { localStorage.setItem('carehub_logged_in', '1'); } catch { /* no-op */ }
  }

  private clearUiState(): void {
    this.isLoggedIn = false;
    this.showLogin = false;
    this.expanded = [false, false, false, false];
    try {
      localStorage.removeItem('carehub_logged_in');
      localStorage.removeItem('carehub_login_intent');
    } catch { /* no-op */ }
  }

  private stripPathFromUrl(): void {
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, location.origin + '/');
    }
  }
}

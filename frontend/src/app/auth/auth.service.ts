import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api';

  readonly isLoggedIn$ = new BehaviorSubject<boolean>(false);
  readonly showLogin$  = new BehaviorSubject<boolean>(false);

  get isLoggedIn(): boolean { return this.isLoggedIn$.value; }
  get showLogin(): boolean { return this.showLogin$.value; }

  toggleLogin(): void {
    this.showLogin$.next(!this.showLogin$.value);
  }

  persistIntent(): void {
    try { localStorage.setItem('carehub_login_intent', '1'); } catch {}
  }

  openProfile(): void {
    alert('Profil (demo)');
  }

  async refreshSessionState(): Promise<void> {
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

  logout(): void {
    window.location.href = '/logout';
  }

  markLoggedIn(): void {
    this.isLoggedIn$.next(true);
    this.showLogin$.next(false);
    try { localStorage.setItem('carehub_logged_in', '1'); } catch {}
  }

  clearUiState(): void {
    this.isLoggedIn$.next(false);
    this.showLogin$.next(false);
    try {
      localStorage.removeItem('carehub_logged_in');
      localStorage.removeItem('carehub_login_intent');
    } catch {}
  }

  stripPathFromUrl(): void {
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, location.origin + '/');
    }
  }
}

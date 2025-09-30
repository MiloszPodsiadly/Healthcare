import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  currentYear = new Date().getFullYear();

  get isLoggedIn$() { return this.auth.isLoggedIn$; }
  get showLogin$()  { return this.auth.showLogin$; }

  get isLoggedIn(): boolean { return this.auth.isLoggedIn; }
  get showLogin(): boolean  { return this.auth.showLogin; }

  constructor(private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    if (location.pathname === '/auth/success') {
      await this.auth.refreshSessionState();
      this.auth.stripPathFromUrl();
      return;
    }
    if (location.pathname === '/auth/logout') {
      this.auth.clearUiState();
      this.auth.stripPathFromUrl();
      return;
    }
    await this.auth.refreshSessionState();
  }

  persistIntent(): void { this.auth.persistIntent(); }
}

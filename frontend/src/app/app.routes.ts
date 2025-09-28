import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';

export const routes: Routes = [
  // landing/login
  { path: '', component: LoginComponent },

  // Sekcja A
  {
    path: 'section-a',
    children: [
      {
        path: 'row-a',
        loadComponent: () =>
          import('./component/sectionA/rowA/row-a.page').then(m => m.RowAPage)
      },
      {
        path: 'row-b',
        loadComponent: () =>
          import('./component/sectionA/rowB/row-b.page').then(m => m.RowBPage)
      },
      { path: '', pathMatch: 'full', redirectTo: 'row-a' }
    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];

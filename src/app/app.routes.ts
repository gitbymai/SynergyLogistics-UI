import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      }, {
        path: 'jobs',
        loadComponent: () =>
          import('./views/jobs/jobs.component').then(m => m.JobsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

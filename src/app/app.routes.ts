import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    data: { title: 'Home' },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then(m => m.routes),
        data: { title: 'Dashboard' },
      },
      {
        path: 'jobs',
        data: { title: 'Jobs' },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./views/jobs/jobs.component').then(m => m.JobsComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./views/jobs/newjob/newjob.component').then(
                m => m.NewjobComponent
              ),
            data: { title: 'New Job' },
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./views/jobs/joblist/joblist.component').then(
                m => m.JoblistComponent
              ),
            data: { title: 'Job List' },
          },
          {
            path: 'jobmanagement/:jobGuid',
            loadComponent: () =>
              import('./views/jobs/jobmanagement/jobmanagement.component').then
                (
                  m => m.JobmanagementComponent
                ),
            data: { title: 'Job Management' }
          },
          {
            path: 'jobmanagement/:jobGuid/charges',
            loadComponent: () =>
              import('./views/jobs/jobchargesmanagement/jobchargesmanagement/jobchargesmanagement.component').then(
                m => m.JobchargesmanagementComponent
              ),
            data: { title: 'Charges Management' }
          },

        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/account/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Login' }
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    canActivate: [AuthGuard],
    data: { title: 'Home' },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then(m => m.routes),
        data: {
          title: 'Dashboard',
          roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
        },
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./views/account/changepassword/changepassword.component').then(
            m => m.ChangepasswordComponent
          ),
        data: {
          title: 'Change Password',
          roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        canActivate: [AuthGuard],
        data: {
          title: 'Admin',
          roles: ['admin']
        },
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./views/admin/manage-users/manage-users.component').then(
                m => m.ManageUsersComponent
              ),
            data: {
              title: 'Manage Users',
              roles: ['admin']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'clients',
            loadComponent: () =>
              import('./views/admin/manage-clients/manage-clients.component').then(
                m => m.ManageClientsComponent
              ),
            data: {
              title: 'Manage Clients',
              roles: ['admin']
            },
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'financial',
        canActivate: [AuthGuard],
        data: {
          title: 'Financial',
          roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./views/financials/chargelist/chargelist.component').then(m => m.ChargelistComponent),
          },
          {
            path: 'cash-advance-requests',
            canActivate: [AuthGuard],
            loadComponent: () => import('./views/cashadvancerequest/lists/lists.component').then(m => m.ListsComponent),
            data: {
              title: 'Cash Advance Requests',
              roles: ['admin', 'cashier', 'finance', 'treasurer']
            },
          },
          {
            path: 'credit-management-list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./views/credit-management/credit-lists/credit-lists.component').then(m => m.CreditListsComponent),
            data: {
              title: 'Credit Management',
              roles: ['admin', 'cashier', 'finance', 'treasurer']
            },
          },
          {
            path: 'credit-management-list/credit-transaction-list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./views/credit-management/credit-transaction-lists/credit-transaction-lists.component').then(m => m.CreditTransactionListsComponent),
            data: {
              title: 'Credit Transaction',
              roles: ['admin', 'cashier', 'finance', 'treasurer']
            },
          },
        ]
      },
      {
        path: 'jobs',
        canActivate: [AuthGuard],
        data: {
          title: 'Jobs',
          roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
        },
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
            data: {
              title: 'New Job',
              roles: ['sales', 'admin']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./views/jobs/joblist/joblist.component').then(
                m => m.JoblistComponent
              ),
            data: {
              title: 'Job List',
              roles: ['sales', 'admin', 'finance', 'treasurer']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'jobmanagement/:jobGuid',
            loadComponent: () =>
              import('./views/jobs/jobmanagement/jobmanagement.component').then(
                m => m.JobmanagementComponent
              ),
            data: {
              title: 'Job Management',
              roles: ['sales', 'admin', 'finance', 'treasurer']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'jobmanagement/:jobGuid/charges',
            loadComponent: () =>
              import('./views/jobs/jobchargesmanagement/jobchargesmanagement/jobchargesmanagement.component').then(
                m => m.JobchargesmanagementComponent
              ),
            data: {
              title: 'Charges Management',
              roles: ['sales', 'admin']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'financials',
            loadComponent: () =>
              import('./views/financials/transactionlist/transactionlist.component').then(
                m => m.TransactionlistComponent
              ),
            data: {
              title: 'Financial Transactions',
              roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
            },
            canActivate: [AuthGuard]
          },
          {
            path: 'financials/chargelists/:jobGuid',
            loadComponent: () =>
              import('./views/financials/chargelist/chargelist.component').then(
                m => m.ChargelistComponent
              ),
            data: {
              title: 'Charge List',
              roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
            },
            canActivate: [AuthGuard]
          }
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./views/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    data: {
      title: 'Unauthorized',
      roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
    }
  },
];
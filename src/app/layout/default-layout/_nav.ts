export const navItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    roles: ['admin', 'cashier', 'finance', 'treasurer', 'opsmgr', 'processor', 'sales']
  },
  {
    name: 'Job Management',
    url: '/jobs',
    iconComponent: { name: 'cil-file' },
    children: [
      {
        name: 'New Job Order',
        url: '/jobs/new',
        iconComponent: { name: 'cil-pencil' },
        roles: ['sales', 'admin']
      },
      {
        name: 'Job List',
        url: '/jobs/list',
        iconComponent: { name: 'cil-menu' },
        roles: ['sales', 'admin', 'finance', 'treasurer']
      },
      {
        name: 'Job List',
        url: '/jobs/financials',
        iconComponent: { name: 'cil-notes' },
        roles: ['admin', 'opsmgr', 'processor','cashier']
      }
    ]
  },
  {
    name: 'Requests & Approvals',
    url:'/approvals',
    iconComponent: { name: 'cil-bell' },
    children: [
      {
        name: 'Petty Cash',
        url: '/approvals/pettycash',
        iconComponent: { name: 'cil-credit-card' },
        roles: ['admin','treasurer','cashier','sales','opsmgr']
      },
      {
        name: 'Owned Transactions',
        url: '/approvals/owned-transactions',
        iconComponent: { name: 'cil-layers' },
        roles: ['admin','processor']
      },
      {
        name: 'Waiting for Ownership',
        url: '/approvals/waiting-for-ownership',
        iconComponent: { name: 'cil-layers' },
        roles: ['admin','processor','opsmgr']
      },
      {
        name: 'Cash Deposit',
        url: '/approvals/cashdeposits',
        iconComponent: { name: 'cil-basket' },
        roles: ['admin', 'finance', 'treasurer']
      },
    ]
  },
  {
    name: 'Financial Management',
    url: '/financial',
    iconComponent: { name: 'cil-file' },
    children: [
      {
        name: 'Credit Management',
        url: '/financial/credit-management-list',
        iconComponent: { name: 'cil-description' },
        roles: ['admin', 'finance', 'treasurer']
      },
      {
        name: 'ICTSI Management',
        url: '/financial/ictsi-management-list',
        iconComponent: { name: 'cil-description' },
        roles: ['admin', 'opsstaff', 'treasurer']
      },
    ]
  },
  {
    name:'Reports & Monitoring',
    url:'/report',
    iconComponent: { name: 'cil-chart' },
    children: [
      {
        name: 'Released Petty Cash',
        url: '/report/pettycash-released',
        iconComponent: { name: 'cil-paper-plane' },
        roles: ['admin','treasurer','cashier','sales']
      },
      {
        name: 'Actual Refunds',
        url: '/report/liquidations',
        iconComponent: { name: 'cil-paper-plane' },
        roles: ['admin','treasurer','cashier','sales']
      }
    ]
  },

  {
    name: 'Data Management',
    url: '/admin',
    iconComponent: { name: 'cil-settings' },
    children: [
      {
        name: 'Manage Users',
        url: '/admin/users',
        iconComponent: { name: 'cil-user' },
        roles: ['admin']
      },
      {
        name: 'Manage Clients',
        url: '/admin/clients',
        iconComponent: { name: 'cil-people' },
        roles: ['admin']
      }
    ]
  }
];

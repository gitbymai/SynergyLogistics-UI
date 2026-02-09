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
        name: 'Transactions',
        url: '/jobs/financials',
        iconComponent: { name: 'cil-notes' },
        roles: ['admin', 'opsmgr', 'processor']
      }
    ]
  },
  {
    name: 'Request Approvals',
    url:'/approvals',
    iconComponent: { name: 'cil-bell' },
    children: [
      {
        name: 'Petty Cash',
        url: '/approvals/pettycash',
        iconComponent: { name: 'cil-credit-card' },
        roles: ['sales', 'admin','treasurer']
      },{
        name: 'Refund',
        url: '/approvals/refund',
        iconComponent: { name: 'cil-paper-plane' },
        roles: ['sales', 'admin','treasurer','cashier']
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
        name: 'Cash Advance Requests',
        url: '/financial/cash-advance-requests',
        iconComponent: { name: 'cil-dollar' },
        roles: ['admin', 'finance', 'treasurer', 'cashier']
      },
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

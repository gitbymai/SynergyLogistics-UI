export const navItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Job Management',
    url: '/jobs',
    iconComponent: { name: 'cil-file' },
    children:[
      {
        name: 'New Job Order',
        url: '/jobs/new',
        iconComponent: { name: 'cil-pencil' }
      },
      {
        name: 'Job List',
        url: '/jobs/list',
        iconComponent: { name: 'cil-list' }
      }
    ]
  },
  {
    name: 'Billing',
    url: '/billing',
    iconComponent: { name: 'cil-description' }
  },
  {
    name: 'Data Management',
    url: '/manage',
    iconComponent: { name: 'cil-settings' },
    children:[
      {
        name: 'Manage Users',
        url: '/users/list',
        iconComponent: { name: 'cil-user' }
      }
    ]
  }
];

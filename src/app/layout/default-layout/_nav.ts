export const navItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Job Orders',
    url: '/jobs',
    iconComponent: { name: 'cil-truck' }
  },
  {
    name: 'Billing',
    url: '/billing',
    iconComponent: { name: 'cil-description' }
  },
  {
    name: 'Users',
    url: '/users',
    iconComponent: { name: 'cil-user' },
    children:[
      {
        name: 'User List',
        url: '/users/list',
        iconComponent: { name: 'cil-list' }
      },
      {
        name: 'User Roles',
        url: '/users/roles',
        iconComponent: { name: 'cil-lock-locked' }
      }
    ]
  }
];

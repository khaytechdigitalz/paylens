// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
  verify: '/verify',
  verify_account: '/verify_account',
  register: '/register',
  forgotpassword: '/forgotpassword',
  api: '/documentation/overview',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  dashboard: path(ROOTS_DASHBOARD, '/home'),

  pos: {
    root: path(ROOTS_DASHBOARD, '/pos'),
    history: path(ROOTS_DASHBOARD, '/pos/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/pos/${details}/details`),
    transactions: path(ROOTS_DASHBOARD, '/pos/transactions'),
  }, 
  
  ticket: {
    root: path(ROOTS_DASHBOARD, '/ticket'),
    history: path(ROOTS_DASHBOARD, '/ticket/history'),
    create: path(ROOTS_DASHBOARD, '/ticket/create'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/ticket/${details}/details`),
  },

  funding: {
    root: path(ROOTS_DASHBOARD, '/funding'),
    history: path(ROOTS_DASHBOARD, '/funding/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/funding/${details}/details`),
    transactions: path(ROOTS_DASHBOARD, '/funding/transactions'),
  },

  virtualcard: {
    root: path(ROOTS_DASHBOARD, '/virtualcard'),
    history: path(ROOTS_DASHBOARD, '/virtualcard/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/virtualcard/${details}/details`),
    transactions: path(ROOTS_DASHBOARD, '/virtualcard/transactions'),
  },

  transactions: {
    root: path(ROOTS_DASHBOARD, '/transactions'),
    history: path(ROOTS_DASHBOARD, '/transactions/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/transactions/${details}/details`),
    refunds: path(ROOTS_DASHBOARD, '/transactions/refunds'),
    refund: (details: string) => path(ROOTS_DASHBOARD, `/transactions/${details}/refund`),
  },

  payout: {
    root: path(ROOTS_DASHBOARD, '/payout'),
    history: path(ROOTS_DASHBOARD, '/payout/history'), 
    request: path(ROOTS_DASHBOARD, '/payout/request'), 
  },

  bills: {
    root: path(ROOTS_DASHBOARD, '/bills'), 
    history: path(ROOTS_DASHBOARD, '/bills/history'),
    airtime: path(ROOTS_DASHBOARD, '/bills/airtime'),
    internet: path(ROOTS_DASHBOARD, '/bills/internet'),
    cabletv: path(ROOTS_DASHBOARD, '/bills/cabletv'),
    electricity: path(ROOTS_DASHBOARD, '/bills/electricity'),
  },

  settlement: path(ROOTS_DASHBOARD, '/settlement/history'),

  /*
  paymentlink: {
    root: path(ROOTS_DASHBOARD, '/paymentlink'),
    history: path(ROOTS_DASHBOARD, '/paymentlink/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/paymentlink/${details}/details`),
  },
  */

  business: {
  root: path(ROOTS_DASHBOARD, '/business'),
  settings: path(ROOTS_DASHBOARD, '/business/settings'),
  settlement: path(ROOTS_DASHBOARD, '/business/settlement'),
  },

  profile: {
  root: path(ROOTS_DASHBOARD, '/profile'),
  settings: path(ROOTS_DASHBOARD, '/profile/settings'),
  password: path(ROOTS_DASHBOARD, '/profile/password'),
  },
  apiconfig: path(ROOTS_DASHBOARD, '/api/config'),
  apiwebhook: path(ROOTS_DASHBOARD, '/api/webhooks'),

  

  two: path(ROOTS_DASHBOARD, '/two'),
  three: path(ROOTS_DASHBOARD, '/three'),
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    four: path(ROOTS_DASHBOARD, '/user/four'),
    five: path(ROOTS_DASHBOARD, '/user/five'),
    six: path(ROOTS_DASHBOARD, '/user/six'),
  },
};

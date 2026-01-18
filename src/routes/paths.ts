// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  dashboard: path(ROOTS_DASHBOARD, '/home'),
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
    cabletv: path(ROOTS_DASHBOARD, '/bills/cabletv'),
    internet: path(ROOTS_DASHBOARD, '/bills/internet'),
    electricity: path(ROOTS_DASHBOARD, '/bills/electricity'),
  },

  settlement: path(ROOTS_DASHBOARD, '/settlement/history'),

  paymentlink: {
    root: path(ROOTS_DASHBOARD, '/paymentlink'),
    history: path(ROOTS_DASHBOARD, '/paymentlink/history'),
    details: (details: string) => path(ROOTS_DASHBOARD, `/paymentlink/${details}/details`),
  },

  business: {
  root: path(ROOTS_DASHBOARD, '/business'),
  settings: path(ROOTS_DASHBOARD, '/business/settings'),
  settlement: path(ROOTS_DASHBOARD, '/business/settlement'),
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

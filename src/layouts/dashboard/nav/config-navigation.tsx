// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  dashboard: icon('ic_dashboard'),
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  banking: icon('ic_banking'),
  analytics: icon('ic_analytics'),
  cart: icon('ic_cart'),
  invoice: icon('ic_invoice'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general v4.1.0',
    items: [
      { title: 'Dashboard', path: PATH_DASHBOARD.dashboard, icon: ICONS.dashboard },
      {
        title: 'Transactions',
        path: PATH_DASHBOARD.transactions.root,
        icon: ICONS.analytics,
        children: [
          { title: 'History', path: PATH_DASHBOARD.transactions.history },
          { title: 'Refunds', path: PATH_DASHBOARD.transactions.refunds },
        ],
      },

      { title: 'Bills Payment', path: PATH_DASHBOARD.bills.history, icon: ICONS.cart },
      { title: 'Bank Transfer', path: PATH_DASHBOARD.payout.history, icon: ICONS.banking },
      { title: 'Payment Link', path: PATH_DASHBOARD.paymentlink.history, icon: ICONS.ecommerce },
      { title: 'Settlement', path: PATH_DASHBOARD.settlement, icon: ICONS.invoice },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'Settings',
    items: [
      {
        title: 'Account',
        path: PATH_DASHBOARD.business.root,
        icon: ICONS.user,
        children: [
          { title: 'Business Settings', path: PATH_DASHBOARD.business.settings },
          { title: 'Settlement Account', path: PATH_DASHBOARD.business.settlement },
        ],
      },

      { title: 'API Credentials', path: PATH_DASHBOARD.apiconfig, icon: ICONS.ecommerce },
    ],
  },
];

export default navConfig;

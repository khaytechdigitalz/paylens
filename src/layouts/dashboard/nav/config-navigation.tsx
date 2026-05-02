// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';

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
  folder: icon('ic_folder'),
  label: icon('ic_label'),
  mail: icon('ic_mail'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
};

// ----------------------------------------------------------------------

export default function useNavConfig() {
  const { user } = useAuthContext();
  
  // Logical check for business account type
  const isBusiness = user?.account_type === 'business';

  const navConfig = [
    // GENERAL
    // ----------------------------------------------------------------------
    {
      subheader: 'General',
      items: [
        { title: 'Dashboard', path: PATH_DASHBOARD.dashboard, icon: ICONS.dashboard },
        /*
        // POS: Only show for Business
        ...(isBusiness
          ? [{ title: 'POS Terminals', path: PATH_DASHBOARD.pos.history, icon: ICONS.ecommerce }]
          : []),
        */

        { title: 'Virtual Accounts', path: PATH_DASHBOARD.funding.ngn, icon: ICONS.banking },
        { title: 'USDT Wallet', path: PATH_DASHBOARD.funding.usdt, icon: ICONS.folder },
        { title: 'Virtual Card', path: PATH_DASHBOARD.virtualcard.history, icon: ICONS.booking },

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
        { title: 'Payout', path: PATH_DASHBOARD.payout.history, icon: ICONS.banking },

        // Settlement: Only show for Business
        ...(isBusiness
          ? [{ title: 'Settlement', path: PATH_DASHBOARD.settlement, icon: ICONS.invoice }]
          : []),

        // Payment Link: Only show for Business
        ...(isBusiness
          ? [
              {
                title: 'Payment Link',
                path: PATH_DASHBOARD.paymentlink.history,
                icon: ICONS.ecommerce,
              },
            ]
          : []),
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
            // Business Settings: Only show for Business
            ...(isBusiness
              ? [{ title: 'Business Settings', path: PATH_DASHBOARD.business.settings }]
              : []),

            // Settlement Account: Only show for Business
            ...(isBusiness
              ? [{ title: 'Settlement Account', path: PATH_DASHBOARD.business.settlement }]
              : []),

            { title: 'Profile', path: PATH_DASHBOARD.profile.settings },
          ],
        },

        // API Credentials: Only show for Business
        ...(isBusiness
          ? [{ title: 'API Credentials', path: PATH_DASHBOARD.apiconfig, icon: ICONS.ecommerce }]
          : []),

        // SUpport TIcket
        { title: 'Support Ticket', path: PATH_DASHBOARD.ticket.history, icon: ICONS.mail },
      ],
    },
  ];

  return navConfig;
}
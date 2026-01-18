// next
import Head from 'next/head';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Button, Stack, Typography, Box } from '@mui/material';

// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import Iconify from '../../components/iconify';
import { fCurrency } from '../../utils/formatNumber';
// _mock_
import {
  _bankingContacts,
  _bankingCreditCard,
  _bankingRecentTransitions,
} from '../../_mock/arrays';

import {
  BankingContacts,
  BankingWidgetSummary,
  BankingInviteFriends,
  BankingQuickTransfer,
  BankingCurrentBalance,
  BankingBalanceStatistics,
  BankingRecentTransitions,
  BankingExpensesCategories,
} from '../../sections/dashboard';
// ----------------------------------------------------------------------

PageOne.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function PageOne() {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();

  return (
    <>
      <Head>
        <title> Business Dashboard | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <BankingCurrentBalance list={_bankingCreditCard} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 5 }} // This margin-bottom pushes the widgets down
            >
              {/* Left Side: Balance Info */}
             

              {/* Right Side: Action Buttons */}
              <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 2, sm: 0 } }}>
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon="eva:arrow-upward-fill" />}
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'grey.300' },
                  }}
                >
                  Send
                </Button>

                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'grey.300' },
                  }}
                >
                  Add card
                </Button>

                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon="eva:arrow-downward-fill" />}
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'grey.300' },
                  }}
                >
                  Request
                </Button>
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <BankingWidgetSummary
                title="Income"
                icon="eva:diagonal-arrow-left-down-fill"
                percent={2.6}
                total={18765}
                chart={{
                  series: [111, 136, 76, 108, 74, 54, 57, 84],
                }}
              />

              <BankingWidgetSummary
                title="Expenses"
                color="warning"
                icon="eva:diagonal-arrow-right-up-fill"
                percent={-0.5}
                total={8938}
                chart={{
                  series: [111, 136, 76, 108, 74, 54, 57, 84],
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <BankingBalanceStatistics
                title="Transaction Statistics"
                subheader="(+43% Income | +12% Expense) than last year"
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  colors: [theme.palette.primary.main, theme.palette.warning.main],
                  series: [
                    {
                      type: 'Week',
                      data: [
                        { name: 'Income', data: [10, 41, 35, 151, 49, 62, 69, 91, 48] },
                        { name: 'Expenses', data: [10, 34, 13, 56, 77, 88, 99, 77, 45] },
                      ],
                    },
                    {
                      type: 'Month',
                      data: [
                        { name: 'Income', data: [148, 91, 69, 62, 49, 51, 35, 41, 10] },
                        { name: 'Expenses', data: [45, 77, 99, 88, 77, 56, 13, 34, 10] },
                      ],
                    },
                    {
                      type: 'Year',
                      data: [
                        { name: 'Income', data: [76, 42, 29, 41, 27, 138, 117, 86, 63] },
                        { name: 'Expenses', data: [80, 55, 34, 114, 80, 130, 15, 28, 55] },
                      ],
                    },
                  ],
                }}
              />

              <BankingExpensesCategories
                title="Bills Payment"
                chart={{
                  series: [
                    { label: 'Airtime', value: 14 },
                    { label: 'Cable TV', value: 23 },
                    { label: 'Internet Subscription', value: 21 },
                    { label: 'Electricity', value: 17 }, 
                  ],
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.warning.dark,
                    theme.palette.success.darker,
                    theme.palette.error.main, 
                  ],
                }}
              />

              <BankingRecentTransitions
                title="Recent Transitions"
                tableData={_bankingRecentTransitions}
                tableLabels={[
                  { id: 'description', label: 'Description' },
                  { id: 'date', label: 'Date' },
                  { id: 'amount', label: 'Amount' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <BankingQuickTransfer title="Quick Transfer" list={_bankingContacts} />

              <BankingContacts
                title="Contacts"
                subheader="You have 122 contacts"
                list={_bankingContacts.slice(-5)}
              />

              <BankingInviteFriends
                price="$50"
                title={`Invite friends \n and earn`}
                description="Praesent egestas tristique nibh. Duis lobortis massa imperdiet quam."
                img="/assets/illustrations/characters/character_11.png"
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
// next
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Grid,
  useTheme,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Label from '../../../components/label';
import { useSettingsContext } from '../../../components/settings';
import { TableHeadCustom } from '../../../components/table';
import LoadingScreen from '../../../components/loading-screen';
// utils
import axios from '../../../utils/axios';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

interface Ticket {
  id: number;
  ticket_id: string;
  subject: string;
  priority: 'urgent' | 'high' | 'low';
  status: 'pending' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface TicketStats {
  total: number;
  open: number;
  urgent: number;
  resolved: number;
}

const TABLE_HEAD = [
  { id: 'ticket_id', label: 'Ticket ID', align: 'left' },
  { id: 'subject', label: 'Subject', align: 'left' },
  { id: 'priority', label: 'Priority', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'created_at', label: 'Date Created', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

// Wrap the page in the Dashboard Layout
SupportTicketPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function SupportTicketPage() {
  const theme = useTheme();
  const router = useRouter();
  const { themeStretch } = useSettingsContext();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/ticket/list');
      if (response.data.status) {
        setTickets(response.data.data.tickets);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Head>
        <title>Support Tickets | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          sx={{ mb: 5 }}
          spacing={2}
        >
          <Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Support Tickets
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage and track your technical inquiries and support requests.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => router.push(PATH_DASHBOARD.ticket.create)}
            sx={{ boxShadow: theme.customShadows.primary, px: 3 }}
          >
            New Ticket
          </Button>
        </Stack>

        {/* Analytics Widgets using the Case Study Style */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            {
              label: 'Total Tickets',
              value: stats?.total,
              color: 'info',
              icon: 'solar:letter-bold-duotone',
            },
            {
              label: 'Open Tickets',
              value: stats?.open,
              color: 'warning',
              icon: 'solar:pen-new-square-bold-duotone',
            },
            {
              label: 'Urgent Tickets',
              value: stats?.urgent,
              color: 'error',
              icon: 'solar:danger-bold-duotone',
            },
            {
              label: 'Resolved Tickets',
              value: stats?.resolved,
              color: 'success',
              icon: 'solar:check-circle-bold-duotone',
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Card
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h3">{item.value || 0}</Typography>
                </Box>
                <Iconify
                  icon={item.icon}
                  width={60}
                  sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    color: `${item.color}.main`,
                    opacity: 0.12,
                    transform: 'rotate(-15deg)',
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {tickets.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{row.ticket_id}</Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {row.subject}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Label
                          variant="soft"
                          color={
                            (row.priority === 'urgent' && 'error') ||
                            (row.priority === 'high' && 'warning') ||
                            'info'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {row.priority}
                        </Label>
                      </TableCell>

                      <TableCell align="center">
                        <Label
                          variant="filled"
                          color={
                            (row.status === 'resolved' && 'success') ||
                            (row.status === 'pending' && 'warning') ||
                            'default'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {row.status}
                        </Label>
                      </TableCell>

                      <TableCell>{fDateTime(row.created_at)}</TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          color="primary"
                          variant="soft"
                          endIcon={<Iconify icon="solar:arrow-right-linear" />}
                          onClick={() =>
                            router.push(`${PATH_DASHBOARD.ticket.root}/${row.ticket_id}/details`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Container>
    </>
  );
}

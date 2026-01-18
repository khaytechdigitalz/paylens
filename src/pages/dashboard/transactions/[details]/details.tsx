import { useState } from 'react';
// next
import Head from 'next/head';
// @mui
import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  Button,
  Divider,
  Box,
  Avatar,
  alpha,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

PageFour.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function PageFour() {
  const { themeStretch } = useSettingsContext();

  // Modal States
  const [openRefund, setOpenRefund] = useState(false);
  const [openWebhook, setOpenWebhook] = useState(false);

  // Mock data for the specific transaction
  const currentTransaction = {
    id: 'TX-12345678',
    status: 'completed', // Can be 'completed', 'pending', or 'failed'
    amount: 1250.0,
    fee: 12.5,
    tax: 5.0,
    net: 1232.5,
    currency: 'USD',
    date: '2026-01-17T10:00:00',
    method: 'Visa **** 4242',
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: '',
      ip: '192.168.1.1',
      location: 'New York, USA',
    },
    history: [
      { title: 'Transaction Completed', time: '2026-01-17T10:05:00', color: 'success' },
      { title: 'Payment Authorized', time: '2026-01-17T10:01:00', color: 'info' },
      { title: 'Transaction Initiated', time: '2026-01-17T10:00:00', color: 'primary' },
    ],
  };

  const isSuccess = currentTransaction.status === 'completed';

  return (
    <>
      <Head>
        <title> Transaction Details | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* Header Section */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Stack spacing={1}>
            <Typography variant="h3">Transaction {currentTransaction.id}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {fDateTime(currentTransaction.date)}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Label status={currentTransaction.status} />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            {/* Conditional Action Buttons: Only show if status is completed/success */}
            {isSuccess && (
              <>
                <Button
                  color="warning"
                  variant="soft"
                  startIcon={<Iconify icon="eva:diagonal-arrow-right-up-fill" />}
                  onClick={() => setOpenWebhook(true)}
                >
                  Resend Webhook
                </Button>

                <Button
                  color="error"
                  variant="soft"
                  startIcon={<Iconify icon="eva:undo-fill" />}
                  onClick={() => setOpenRefund(true)}
                >
                  Refund
                </Button>
              </>
            )}

            <Button variant="contained" startIcon={<Iconify icon="eva:printer-fill" />}>
              Print Receipt
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Content Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  General Information
                </Typography>
                <Grid container spacing={3}>
                  <InfoItem
                    label="Gross Amount"
                    value={fCurrency(currentTransaction.amount)}
                    color="primary.main"
                    isBold
                  />
                  <InfoItem label="Payment Method" value={currentTransaction.method} />
                  <InfoItem label="Reference ID" value={currentTransaction.id} />
                  <InfoItem label="Currency" value={currentTransaction.currency} />
                </Grid>
              </Card>

              <Card>
                <Box sx={{ p: 3, pb: 2 }}>
                  <Typography variant="h6">Payment Breakdown</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <BreakdownRow
                        label="Base Amount"
                        value={fCurrency(currentTransaction.amount)}
                      />
                      <BreakdownRow
                        label="Processing Fee"
                        value={`- ${fCurrency(currentTransaction.fee)}`}
                        color="error.main"
                      />
                      <BreakdownRow
                        label="Taxes"
                        value={`- ${fCurrency(currentTransaction.tax)}`}
                        color="error.main"
                      />
                      <TableRow>
                        <TableCell sx={{ typography: 'subtitle1' }}>Net Settlement</TableCell>
                        <TableCell align="right" sx={{ typography: 'h6', color: 'success.main' }}>
                          {fCurrency(currentTransaction.net)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Activity Log
                </Typography>
                <Timeline position="right" sx={{ p: 0 }}>
                  {currentTransaction.history.map((item, index) => (
                    <TimelineItem key={index} sx={{ '&:before': { display: 'none' } }}>
                      <TimelineSeparator>
                        <TimelineDot color={item.color as any} variant="filled" />
                        {index !== currentTransaction.history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pb: 3 }}>
                        <Typography variant="subtitle2">{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {fDateTime(item.time)}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Admin Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a private note..."
                  variant="outlined"
                />
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Button variant="contained" color="inherit">
                    Save Note
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Sidebar Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Customer Profile
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {currentTransaction.customer.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{currentTransaction.customer.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {currentTransaction.customer.email}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                <Stack spacing={1.5}>
                  <DetailBox label="Location" value={currentTransaction.customer.location} />
                  <DetailBox label="IP Address" value={currentTransaction.customer.ip} />
                  <DetailBox label="Risk Assessment" value="Low Risk" color="success.main" />
                </Stack>
              </Card>

              <Card
                sx={{
                  p: 3,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                  border: (theme) => `1px dashed ${theme.palette.info.main}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2, color: 'info.main' }}
                >
                  <Iconify icon="eva:shield-checkmark-fill" width={24} />
                  <Typography variant="subtitle2">Verified Payment</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  This transaction passed 3D Secure authentication and matches historical behavior.
                </Typography>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* --- CONFIRMATION MODALS --- */}

      {/* Refund Confirmation Modal */}
      <Dialog open={openRefund} onClose={() => setOpenRefund(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="eva:alert-triangle-fill" sx={{ color: 'error.main' }} />
          Confirm Refund
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to refund transaction <strong>{currentTransaction.id}</strong>. This will
            return <strong>{fCurrency(currentTransaction.amount)}</strong> to the customer. This
            action cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button color="inherit" onClick={() => setOpenRefund(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenRefund(false)}>
            Confirm Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resend Webhook Confirmation Modal */}
      <Dialog open={openWebhook} onClose={() => setOpenWebhook(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="eva:cloud-upload-fill" sx={{ color: 'info.main' }} />
          Resend Webhook
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to manually resend the webhook notification for this transaction. This
            will trigger a POST request to your configured endpoint with the current transaction
            data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button color="inherit" onClick={() => setOpenWebhook(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenWebhook(false)}>
            Send Webhook
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function Label({ status }: { status: string }) {
  const isSuccess = status === 'completed';
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        bgcolor: (theme) =>
          alpha(isSuccess ? theme.palette.success.main : theme.palette.warning.main, 0.16),
        color: isSuccess ? 'success.main' : 'warning.main',
      }}
    >
      {status}
    </Typography>
  );
}

function InfoItem({
  label,
  value,
  color,
  isBold,
}: {
  label: string;
  value: string;
  color?: string;
  isBold?: boolean;
}) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ color: color || 'text.primary', fontWeight: isBold ? 800 : 600 }}
      >
        {value}
      </Typography>
    </Grid>
  );
}

function BreakdownRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <TableRow>
      <TableCell sx={{ color: 'text.secondary' }}>{label}</TableCell>
      <TableCell align="right" sx={{ color: color || 'text.primary', fontWeight: 600 }}>
        {value}
      </TableCell>
    </TableRow>
  );
}

function DetailBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

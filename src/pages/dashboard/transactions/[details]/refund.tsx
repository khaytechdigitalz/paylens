/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { alpha } from '@mui/material/styles';
import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  Button, 
  Box,
  Avatar, 
  TextField,
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

RefundDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

// ----------------------------------------------------------------------

export default function RefundDetailsPage() {
  const { push } = useRouter();
  const { themeStretch } = useSettingsContext();

  // Mock data for the specific refund
  const currentRefund = {
    id: 'RF-9901',
    originalTransactionId: 'TX-12345678',
    status: 'completed',
    amount: 1250.0,
    currency: 'USD',
    date: '2026-01-17T14:30:00',
    reason: 'Customer reported accidental duplicate purchase',
    refundMethod: 'Original Payment Method (Visa **** 4242)',
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    history: [
      { title: 'Refund Disbursed', time: '2026-01-17T15:00:00', color: 'success' },
      { title: 'Refund Approved by Admin', time: '2026-01-17T14:45:00', color: 'info' },
      { title: 'Refund Request Received', time: '2026-01-17T14:30:00', color: 'primary' },
    ],
  };

  return (
    <>
      <Head>
        <title> Refund Details | PayLens</title>
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h3">Refund {currentRefund.id}</Typography>
              <RefundStatusLabel status={currentRefund.status} />
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Processed on {fDateTime(currentRefund.date)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="soft"
              color="inherit"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => push('/dashboard/transactions/refunds')}
            >
              Back to List
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="eva:printer-fill" />}>
              Print Advice
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Refund Summary Card */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Refund Summary
                </Typography>
                <Grid container spacing={3}>
                  <InfoItem
                    label="Refund Amount"
                    value={fCurrency(currentRefund.amount)}
                    color="error.main"
                    isBold
                  />
                  <InfoItem label="Refund Method" value={currentRefund.refundMethod} />
                  <InfoItem
                    label="Original Transaction"
                    value={currentRefund.originalTransactionId}
                    isLink
                    onClick={() =>
                      push(`/dashboard/transactions/${currentRefund.originalTransactionId}/details`)
                    }
                  />
                  <InfoItem label="Currency" value={currentRefund.currency} />
                </Grid>
              </Card>

              {/* Refund Reason Card */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Reason for Refund
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Typography variant="body2">{currentRefund.reason}</Typography>
                </Box>
              </Card>

              {/* Timeline */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Refund Timeline
                </Typography>
                <Timeline position="right" sx={{ p: 0 }}>
                  {currentRefund.history.map((item, index) => (
                    <TimelineItem key={index} sx={{ '&:before': { display: 'none' } }}>
                      <TimelineSeparator>
                        <TimelineDot color={item.color as any} />
                        {index !== currentRefund.history.length - 1 && <TimelineConnector />}
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
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Customer Profile */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Customer Details
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                    {currentRefund.customer.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{currentRefund.customer.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {currentRefund.customer.email}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Internal Notes */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Internal Notes
                </Typography>
                <TextField fullWidth multiline rows={3} placeholder="Add private comments..." />
                <Button fullWidth variant="contained" color="inherit" sx={{ mt: 2 }}>
                  Save Note
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function RefundStatusLabel({ status }: { status: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 0.75,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        color: (theme) =>
          status === 'completed' ? theme.palette.success.dark : theme.palette.warning.dark,
        bgcolor: (theme) =>
          alpha(
            status === 'completed' ? theme.palette.success.main : theme.palette.warning.main,
            0.16
          ),
      }}
    >
      {status}
    </Typography>
  );
}

function InfoItem({ label, value, color, isBold, isLink, onClick }: any) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        onClick={onClick}
        sx={{
          color: color || 'text.primary',
          fontWeight: isBold ? 800 : 600,
          cursor: isLink ? 'pointer' : 'default',
          textDecoration: isLink ? 'underline' : 'none',
        }}
      >
        {value}
      </Typography>
    </Grid>
  );
}

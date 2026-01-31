/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
// next
import { useRouter } from 'next/router';
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
  alpha,
  Paper,
  IconButton,
  useTheme,
  CardHeader,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from '../../../../components/settings';
import LoadingScreen from '../../../../components/loading-screen';
import EmptyContent from '../../../../components/empty-content';
import Label from '../../../../components/label';
// utils
import axios from '../../../../utils/axios';
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

RefundDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function RefundDetailsPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { query, isReady, push } = useRouter();

  const { details } = query;
  const [refundData, setRefundData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getRefundDetails = useCallback(async () => {
    if (!details) return;
    try {
      setLoading(true);
      setError(false);
      // Fetching from your specific endpoint
      const response = await axios.get(`/refund/${details}`);
      setRefundData(response.data.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [details]);

  useEffect(() => {
    if (isReady) getRefundDetails();
  }, [isReady, getRefundDetails]);

  if (loading && !refundData) return <LoadingScreen />;

  if (error || !refundData) {
    return (
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <EmptyContent
          title="Refund Record Not Found"
          description="We couldn't find the refund details for this reference."
        />
      </Container>
    );
  }

  const { transaction, amount, status, refund_ref, created_at, updated_at, reason } = refundData;
  const isPending = status === 'pending';
  const isRejected = status === 'rejected' || status === 'declined';

  return (
    <>
      <Head>
        <title>Refund Details: {refund_ref} | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* HEADER & ACTIONS */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          sx={{ mb: 5 }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => push('/dashboard/refunds')} sx={{ bgcolor: 'action.hover' }}>
              <Iconify icon="eva:arrow-back-fill" />
            </IconButton>
            <Box>
              <Typography variant="h4">Refund Details</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                REFUND REF: {refund_ref}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:printer-fill" />}
            >
              Print
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="eva:share-fill" />}>
              Share
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* LEFT: STATUS & SUMMARY SLIP */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  position: 'relative',
                  bgcolor: 'background.neutral',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                {/* Decorative Receipt Cutout */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 20,
                    bgcolor: 'background.default',
                    borderRadius: '0 0 50px 50px',
                  }}
                />

                <Stack alignItems="center" sx={{ mb: 3, textAlign: 'center' }}>
                  <Label
                    variant="soft"
                    color={
                      status === 'success' || status === 'completed'
                        ? 'success'
                        : isPending
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ textTransform: 'uppercase', mb: 2 }}
                  >
                    {status}
                  </Label>
                  <Typography variant="h3">
                    {fCurrency(amount, transaction?.currency || 'NGN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Total Refund Amount
                  </Typography>
                </Stack>

                <Stack spacing={2} sx={{ mt: 4 }}>
                  <DetailItem label="Date Created" value={fDateTime(created_at)} />
                  <DetailItem label="Last Updated" value={fDateTime(updated_at)} />
                  <DetailItem
                    label="Orig. Transaction"
                    value={transaction?.reference}
                    isLink
                    onClick={() =>
                      push(`/dashboard/transactions/${transaction?.id}/details`)
                    }
                  />
                  <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                  <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                    Environment
                  </Typography>
                  <DetailItem label="Mode" value={transaction?.mode?.toUpperCase()} />
                </Stack>
              </Paper>

              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Refund Reason
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontStyle: reason ? 'normal' : 'italic' }}
                >
                  {reason || 'No specific reason was provided for this refund request.'}
                </Typography>
              </Card>
            </Stack>
          </Grid>

          {/* RIGHT: DETAILED BREAKDOWN & TIMELINE */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* TRANSACTION INFORMATION */}
              <Card>
                <CardHeader title="Transaction Breakdown" />
                <Box sx={{ p: 3 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', pl: 0 }}>Description</TableCell>
                        <TableCell align="right">{transaction?.description || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', pl: 0 }}>Category</TableCell>
                        <TableCell align="right">
                          <Label color="info" variant="outlined">
                            {transaction?.category}
                          </Label>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', pl: 0, border: 0 }}>
                          Transaction Status
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0 }}>
                          Success
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Card>

              {/* TIMELINE / PROCESS TRACKER */}
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Process Timeline
                </Typography>
                <Stack spacing={3}>
                  <TimelineStep
                    title="Refund Requested"
                    time={fDateTime(created_at)}
                    isDone
                    icon="eva:file-text-fill"
                  />
                  <TimelineStep
                    title="Payment Provider Processing"
                    time={isPending ? 'Processing...' : fDateTime(updated_at)}
                    isDone={!isPending}
                    icon="eva:options-2-fill"
                  />
                  <TimelineStep
                    title={isRejected ? 'Refund Rejected' : 'Funds Disbursed'}
                    time={!isPending ? fDateTime(updated_at) : 'Pending'}
                    isDone={!isPending}
                    isError={isRejected}
                    icon={isRejected ? 'eva:close-circle-fill' : 'eva:checkmark-circle-fill'}
                  />
                </Stack>
              </Card> 
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

// --- SUB-COMPONENTS ---

function DetailItem({ label, value, isLink, onClick }: any) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        onClick={onClick}
        sx={{
          cursor: isLink ? 'pointer' : 'default',
          color: isLink ? 'primary.main' : 'text.primary',
          '&:hover': { textDecoration: isLink ? 'underline' : 'none' },
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function TimelineStep({ title, time, isDone, isError, icon }: any) {
  return (
    <Stack direction="row" spacing={2}>
      <Stack alignItems="center">
        <Box
          sx={{
            p: 1,
            borderRadius: '50%',
            color: isError ? 'error.main' : isDone ? 'success.main' : 'text.disabled',
            bgcolor: alpha(isError ? '#FF4842' : isDone ? '#54D62C' : '#919EAB', 0.12),
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ width: 2, vflex: 1, bgcolor: 'divider', minHeight: 20 }} />
      </Stack>
      <Box>
        <Typography variant="subtitle2" sx={{ color: isDone ? 'text.primary' : 'text.disabled' }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {time}
        </Typography>
      </Box>
    </Stack>
  );
}

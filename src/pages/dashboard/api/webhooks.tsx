/* eslint-disable func-names */
/* eslint-disable react/jsx-no-bind */
import { useState, useEffect, useCallback, JSXElementConstructor, Key, ReactElement, ReactFragment, ReactPortal } from 'react';
import Head from 'next/head';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  TableBody,
  Container,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
  Drawer,
  Box,
  CircularProgress,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { useSettingsContext } from '../../../components/settings';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../components/table';
// utils
import { fDateTime } from '../../../utils/formatTime';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ip_address', label: 'IP Address', align: 'left' },
  { id: 'event', label: 'Event Type', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'timestamp', label: 'Timestamp', align: 'left' },
  { id: 'transaction_id', label: 'Transaction ID', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

WebhookLogsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function WebhookLogsPage() {
  const { themeStretch } = useSettingsContext();

  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({ defaultRowsPerPage: 10 });

  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Drawer States
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint: {{baseurl}}/webhooks/logs
      const response = await axios.get('/webhooks/logs');
      setTableData(response.data.data.data);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDrawer = (log: any) => {
    // Parse the stringified webhook_data for display
    let parsedData = {};
    try {
      parsedData = JSON.parse(log.webhook_data);
    } catch (e) {
      parsedData = { error: 'Invalid JSON data' };
    }
    setSelectedLog({ ...log, parsedData });
    setOpenDrawer(true);
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterStatus,
  });

  const isNotFound = !dataFiltered.length && !loading;

  return (
    <>
      <Head>
        <title> Webhook Logs | CredDot</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Webhook Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and debug real-time event notifications sent to your endpoints.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:refresh-fill" />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>

        <Card>
          <Tabs
            value={filterStatus}
            onChange={(e, newValue) => {
              setFilterStatus(newValue);
              setPage(0);
            }}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {['all', 'success', 'failed'].map((tab) => (
              <Tab key={tab} label={tab} value={tab} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Tabs>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={onSort}
                />

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(
                        (row: {
                          ip_address: string | string[];
                          webhook_response: string | string[];
                          id: Key | null | undefined;
                          event:
                            | string
                            | number
                            | boolean
                            | ReactElement<any, string | JSXElementConstructor<any>>
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                          created_at: string | number | Date | null;
                          transaction_id:
                            | string
                            | number
                            | boolean
                            | ReactElement<any, string | JSXElementConstructor<any>>
                            | ReactFragment
                            | ReactPortal
                            | null
                            | undefined;
                        }) => {
                          // Extracting status from webhook_response string if status_code is null
                          const isSuccess = row.webhook_response?.includes('200 OK');

                          return (
                            <TableRow hover key={row.id}>
                              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {row.ip_address}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {row.event}
                              </TableCell>

                              <TableCell>
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 0.75,
                                    typography: 'caption',
                                    fontWeight: 'bold',
                                    bgcolor: isSuccess ? 'success.lighter' : 'error.lighter',
                                    color: isSuccess ? 'success.dark' : 'error.dark',
                                  }}
                                >
                                  {isSuccess ? '200 OK' : 'FAILED'}
                                </Box>
                              </TableCell>

                              <TableCell>{fDateTime(row.created_at)}</TableCell>

                              <TableCell sx={{ color: 'text.secondary', typography: 'caption' }}>
                                {row.transaction_id}
                              </TableCell>

                              <TableCell align="right">
                                <Tooltip title="View Payload">
                                  <IconButton onClick={() => handleOpenDrawer(row)} color="primary">
                                    <Iconify icon="eva:eye-fill" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )
                  )}
                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* DETAIL DRAWER */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 560 } } }}
      >
        {selectedLog && (
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Request Details</Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Target URL
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>
                  {selectedLog.webhook_url}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Full Server Response
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#1C252E',
                    color: '#45FFBC',
                    borderRadius: 1,
                    typography: 'caption',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedLog.webhook_response}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  JSON Payload (webhook_data)
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#1C252E',
                    color: '#BCC2C8',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    overflow: 'auto',
                  }}
                >
                  <pre>{JSON.stringify(selectedLog.parsedData, null, 2)}</pre>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Iconify icon="eva:refresh-fill" />}
                onClick={() =>
                  alert('Resend functionality to be implemented with backend endpoint.')
                }
              >
                Resend This Webhook
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filterStatus }: any) {
  const stabilizedThis = inputData.map((el: any, index: number) => [el, index]);
  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el: any) => el[0]);

  if (filterStatus !== 'all') {
    inputData = inputData.filter((item: any) => {
      const isSuccess = item.webhook_response?.includes('200 OK');
      return filterStatus === 'success' ? isSuccess : !isSuccess;
    });
  }

  return inputData;
}

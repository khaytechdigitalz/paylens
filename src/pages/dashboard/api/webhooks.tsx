/* eslint-disable func-names */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-no-bind */
import { useState } from 'react';
// next
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
// Internal Component (Toolbar for filtering)

// ----------------------------------------------------------------------

interface WebhookLog {
  id: string;
  event: string;
  url: string;
  status: number;
  timestamp: string;
  payload: object;
  response: string;
}

const TABLE_HEAD = [
  { id: 'event', label: 'Event Type', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'timestamp', label: 'Timestamp', align: 'left' },
  { id: 'id', label: 'Request ID', align: 'left' },
  { id: '' },
];

const TABLE_DATA: WebhookLog[] = [
  {
    id: 'wh_log_01',
    event: 'transaction.success',
    url: 'https://api.site.com/wh',
    status: 200,
    timestamp: '2026-01-17T16:20:00',
    payload: { id: 'TX-1' },
    response: 'OK',
  },
  {
    id: 'wh_log_02',
    event: 'transaction.failed',
    url: 'https://api.site.com/wh',
    status: 400,
    timestamp: '2026-01-17T15:45:00',
    payload: { id: 'TX-2' },
    response: 'Bad Request',
  },
  {
    id: 'wh_log_03',
    event: 'refund.completed',
    url: 'https://api.site.com/wh',
    status: 500,
    timestamp: '2026-01-17T14:10:00',
    payload: { id: 'RF-1' },
    response: 'Internal Server Error',
  },
  {
    id: 'wh_log_04',
    event: 'payout.processed',
    url: 'https://api.site.com/wh',
    status: 200,
    timestamp: '2026-01-17T12:00:00',
    payload: { id: 'PY-1' },
    response: 'OK',
  },
];

// ----------------------------------------------------------------------

WebhookLogsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function WebhookLogsPage() {
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage,  onSort, onChangePage, onChangeRowsPerPage } =
    useTable();

  // Filter States
  const [filterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Drawer States
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const handleOpenDrawer = (log: WebhookLog) => {
    setSelectedLog(log);
    setOpenDrawer(true);
  };

  const dataFiltered = applyFilter({
    inputData: TABLE_DATA,
    comparator: getComparator(order, orderBy),
    filterName,
    filterStatus,
  });

  return (
    <>
      <Head>
        <title> Webhook Logs | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h3">Webhook Logs</Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:refresh-fill" />}>
            Refresh Logs
          </Button>
        </Stack>

        <Card>
          <Tabs
            value={filterStatus}
            onChange={(e, newValue) => setFilterStatus(newValue)}
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
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: WebhookLog) => (
                      <TableRow hover key={row.id}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.event}</TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.75,
                              typography: 'caption',
                              fontWeight: 'bold',
                              bgcolor: row.status === 200 ? 'success.lighter' : 'error.lighter',
                              color: row.status === 200 ? 'success.dark' : 'error.dark',
                            }}
                          >
                            {row.status}
                          </Box>
                        </TableCell>

                        <TableCell>{fDateTime(row.timestamp)}</TableCell>

                        <TableCell sx={{ color: 'text.secondary', typography: 'caption' }}>
                          {row.id}
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleOpenDrawer(row)} color="primary">
                              <Iconify icon="eva:eye-fill" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  <TableNoData isNotFound={!dataFiltered.length} />
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
        PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
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
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {selectedLog.url}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Response Body
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'error.lighter',
                    color: 'error.dark',
                    borderRadius: 1,
                    typography: 'caption',
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedLog.response}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  JSON Payload
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#1C252E',
                    color: '#BCC2C8',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    overflow: 'auto',
                  }}
                >
                  <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                </Box>
              </Box>

              <Button fullWidth variant="contained" startIcon={<Iconify icon="eva:refresh-fill" />}>
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

function applyFilter({ inputData, comparator, filterName, filterStatus }: any) {
  const stabilizedThis = inputData.map((el: any, index: number) => [el, index]);
  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el: any) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (item: any) =>
        item.event.toLowerCase().includes(filterName.toLowerCase()) ||
        item.id.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((item: any) =>
      filterStatus === 'success' ? item.status === 200 : item.status !== 200
    );
  }

  return inputData;
}

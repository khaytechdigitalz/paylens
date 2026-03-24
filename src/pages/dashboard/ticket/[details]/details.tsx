import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Container,
  Typography,
  TextField,
  Divider,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  Paper,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import Label from '../../../../components/label';
import { useSettingsContext } from '../../../../components/settings';
import { useSnackbar } from '../../../../components/snackbar';
// utils
import axios from '../../../../utils/axios';
import { fDateTime } from '../../../../utils/formatTime';

// ----------------------------------------------------------------------

TicketDetailsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function TicketDetailsPage() {
  const theme = useTheme();
  const { query, push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();

  const { details: ticketId } = query;
  const scrollRef = useRef<any>(null);

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [closeStatus, setCloseStatus] = useState('resolved');
  const [isClosing, setIsClosing] = useState(false);

  // Checks if the ticket is finalized
  const isFinalized = ticket?.status === 'closed' || ticket?.status === 'resolved';

  const fetchDetails = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await axios.get(`/ticket/details/${ticketId}`);
      if (response.data.status) {
        setTicket(response.data.data.ticket);
        setMessages(response.data.data.ticket.messages);
      }
    } catch (error) {
      enqueueSnackbar('Failed to fetch ticket details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [ticketId, enqueueSnackbar]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.getScrollElement();
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/ticket/details/${ticketId}`, { message: reply });
      if (response.data.status) {
        setReply('');
        await fetchDetails();
      }
    } catch (error) {
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    setIsClosing(true);
    try {
      const response = await axios.post(`/ticket/close/${ticketId}`, { status: closeStatus });
      if (response.data.status) {
        enqueueSnackbar(response.data.message || 'Ticket updated successfully');
        setOpenCloseModal(false);
        await fetchDetails();
      }
    } catch (error) {
      enqueueSnackbar('Failed to close ticket', { variant: 'error' });
    } finally {
      setIsClosing(false);
    }
  };

  if (loading && !ticket)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Head>
        <title>Ticket Case: {ticketId} | PayLens</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => push('/dashboard/ticket/list')}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <Box>
              <Typography variant="h4">{ticket?.subject}</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                ID: {ticket?.ticket_id} • Opened {fDateTime(ticket?.created_at)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Thread">
              <IconButton onClick={fetchDetails}>
                <Iconify icon="eva:refresh-fill" />
              </IconButton>
            </Tooltip>

            {!isFinalized && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="eva:close-circle-fill" />}
                onClick={() => setOpenCloseModal(true)}
              >
                Close Ticket
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <Scrollbar
                sx={{ p: 3, flexGrow: 1, bgcolor: alpha(theme.palette.grey[500], 0.04) }}
              >
                <Stack spacing={2.5}>
                  {messages.map((msg, index) => {
                    const isMe = msg.is_admin_reply === 0;
                    const showAvatar =
                      index === 0 || messages[index - 1].is_admin_reply !== msg.is_admin_reply;
                    return (
                      <Stack
                        key={msg.id}
                        direction="row"
                        justifyContent={isMe ? 'flex-end' : 'flex-start'}
                        spacing={1.5}
                      >
                        {!isMe && (
                          <Box sx={{ width: 32 }}>
                            {showAvatar && (
                              <Avatar src={msg.user?.avatar} sx={{ width: 32, height: 32 }} />
                            )}
                          </Box>
                        )}
                        <Box sx={{ maxWidth: '75%' }}>
                          {showAvatar && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mb: 0.5,
                                color: 'text.secondary',
                                textAlign: isMe ? 'right' : 'left',
                              }}
                            >
                              {isMe ? 'You' : msg.user?.name}
                            </Typography>
                          )}
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              typography: 'body2',
                              whiteSpace: 'pre-wrap',
                              bgcolor: isMe ? 'primary.main' : 'background.paper',
                              color: isMe ? 'primary.contrastText' : 'text.primary',
                              boxShadow: theme.customShadows.z8,
                              ...(isMe ? { borderTopRightRadius: 0 } : { borderTopLeftRadius: 0 }),
                            }}
                          >
                            {msg.message}
                          </Paper>
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              display: 'block',
                              color: 'text.disabled',
                              textAlign: isMe ? 'right' : 'left',
                            }}
                          >
                            {fDateTime(msg.created_at)}
                          </Typography>
                        </Box>
                        {isMe && (
                          <Box sx={{ width: 32 }}>
                            {showAvatar && (
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                                <Iconify icon="eva:person-fill" width={16} />
                              </Avatar>
                            )}
                          </Box>
                        )}
                      </Stack>
                    );
                  })}
                </Stack>
              </Scrollbar>

              {/* Conditional Reply Area */}
              {!isFinalized ? (
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <LoadingButton
                            loading={isSubmitting}
                            onClick={handleSend}
                            variant="contained"
                            sx={{ borderRadius: 1 }}
                          >
                            <Iconify icon="eva:navigation-2-fill" />
                          </LoadingButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    This ticket is <b>{ticket?.status}</b>. Further replies are disabled.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Case Intelligence
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Status
                  </Typography>
                  <Label color={isFinalized ? 'success' : 'warning'} variant="soft">
                    {ticket?.status}
                  </Label>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Priority Level
                  </Typography>
                  <Label color={ticket?.priority === 'urgent' ? 'error' : 'info'} variant="filled">
                    {ticket?.priority}
                  </Label>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Typography variant="caption" color="text.disabled">
                  Last Updated: {fDateTime(ticket?.updated_at)}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Close Ticket Modal */}
        <Dialog
          open={openCloseModal}
          onClose={() => setOpenCloseModal(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Finalize Ticket</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Are you sure you want to close this ticket? Select the final resolution state.
            </Typography>
            <TextField
              select
              fullWidth
              label="Resolution Status"
              value={closeStatus}
              onChange={(e) => setCloseStatus(e.target.value)}
            >
              <MenuItem value="resolved">Resolved (Issue Fixed)</MenuItem>
              <MenuItem value="closed">Closed (No further action)</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setOpenCloseModal(false)}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              color="error"
              loading={isClosing}
              onClick={handleCloseTicket}
            >
              Confirm Close
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

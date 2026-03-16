/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Divider,
  Paper,
  Badge,
  alpha,
  useTheme,
  styled,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const StyledSearch = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 12px',
  width: 300,
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
}));

// Function to mask PAN (Card Number)
const maskCardNumber = (pan: string | null) => {
  if (!pan) return '**** **** **** ****';
  return `**** **** **** ${pan.slice(-4)}`;
};

VirtualCardLogPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default function VirtualCardLogPage() {
  const theme = useTheme();
  const router = useRouter();
  const { themeStretch } = useSettingsContext();

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint updated to /virtualcard/log
      const response = await axios.get('/virtualcard/log');
      setCards(response.data.cards);
    } catch (error) {
      setErrorMessage('Unable to retrieve virtual card data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Head>
        <title>Virtual Cards | CredDot</title>
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
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
              Virtual Card Management
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Securely monitor and manage your issued virtual payment cards.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:card-plus-bold-duotone" />}
            // Updated push destination
            onClick={() => router.push('/dashboard/virtualcard/request')}
            sx={{ boxShadow: theme.customShadows.primary, px: 3, fontWeight: 700 }}
          >
            Request New Card
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  {/* CARD VISUAL HEADER */}
                  <Box
                    sx={{
                      p: 3,
                      background:
                        card.status === 'active'
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.grey[700]} 0%, ${theme.palette.grey[600]} 100%)`,
                      color: 'common.white',
                      position: 'relative',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      sx={{ mb: 4 }}
                    >
                      <Iconify icon="solar:plain-2-bold-duotone" width={32} sx={{ opacity: 0.8 }} />
                      <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 900 }}>
                        {card.brand || 'VISA'}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h5"
                      sx={{ letterSpacing: 3, mb: 1, fontFamily: 'monospace' }}
                    >
                      {maskCardNumber(card.pan)}
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        EXP: {card.expiry_month || 'XX'}/{card.expiry_year || 'XX'}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {card.currency}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* DETAILS SECTION */}
                  <Box sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', display: 'block' }}
                        >
                          Status
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: card.status === 'active' ? 'success.main' : 'warning.main',
                            textTransform: 'capitalize',
                          }}
                        >
                          {card.status}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', display: 'block' }}
                        >
                          Reference
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                          {card.reference}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

                    <Button
                      fullWidth
                      variant="soft"
                      color="inherit"
                      onClick={() => router.push(`/dashboard/virtualcard/${card.card_id}/details`)}
                      sx={{ fontWeight: 700 }}
                    >
                      Manage Card
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}

            {cards.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ py: 10, textAlign: 'center', bgcolor: 'background.neutral' }}>
                  <Iconify
                    icon="solar:card-search-bold-duotone"
                    width={64}
                    sx={{ mb: 2, color: 'text.disabled' }}
                  />
                  <Typography variant="h6">No Virtual Cards Found</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    You have not requested any virtual cards yet.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
}

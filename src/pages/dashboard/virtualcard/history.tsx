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
  alpha,
  useTheme,
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

// Function to mask PAN (Card Number) safely
const maskCardNumber = (pan: string | null) => {
  if (!pan) return '••••  ••••  ••••  ••••';
  const cleanPan = pan.replace(/\s+/g, '');
  return `••••  ••••  ••••  ${cleanPan.slice(-4)}`;
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
      const response = await axios.get('/virtualcard/log');
      setCards(response.data.cards || []);
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

  // Route router handler conditionally matching bridgecard provider context safely
  const handleManageCardRoute = (card: any) => {
    const isBridge = String(card?.provider).toLowerCase() === 'bridgecard';
    if (isBridge) {
      router.push(`/dashboard/virtualcard/${card.card_id}/bridge`);
    } else {
      router.push(`/dashboard/virtualcard/${card.card_id}/details`);
    }
  };

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
            onClick={() => router.push('/dashboard/virtualcard/bridge')}
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
            {cards.map((card) => {
              const isUsd = String(card.currency).toUpperCase() === 'USD';
              const isActive = card.status === 'active';

              // Dynamic Premium Glass Card Skin Rendering
              let cardBackground = `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`; // Premium USD Dark Carbon
              if (!isActive) {
                cardBackground = `linear-gradient(135deg, ${theme.palette.grey[600]} 0%, ${theme.palette.grey[700]} 100%)`; // Inactive/Frozen Muted Matte
              } else if (!isUsd) {
                cardBackground = `linear-gradient(135deg, ${theme.palette.primary.darker} 0%, ${theme.palette.primary.main} 100%)`; // Corporate NGN Branding Blue
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={card.id}>
                  <Card
                    sx={{
                      p: 0,
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: theme.customShadows.z12,
                      },
                    }}
                  >
                    {/* VISUAL HIGH-END CREDIT CARD FRAME */}
                    <Box
                      sx={{
                        p: 3,
                        background: cardBackground,
                        color: 'common.white',
                        position: 'relative',
                        minHeight: 185,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Top Layer Matrix */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon="solar:chip-bold"
                            width={28}
                            sx={{
                              color: 'warning.light',
                              transform: 'rotate(90deg)',
                              opacity: 0.9,
                            }}
                          />
                          <Iconify
                            icon="solar:wireless-signals-bold"
                            width={20}
                            sx={{ opacity: 0.6, transform: 'rotate(90deg)' }}
                          />
                        </Stack>

                        {/* Dynamic network visual brand rendering asset fallback */}
                        <Iconify
                          icon={
                            String(card.brand).toLowerCase() === 'visa'
                              ? 'logos:visa'
                              : 'logos:mastercard'
                          }
                          width={42}
                          style={{ filter: !isActive ? 'grayscale(100%)' : 'none' }}
                        />
                      </Stack>

                      {/* PAN Middle Section Matrix */}
                      <Box sx={{ my: 2 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            textShadow: '1px 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          {maskCardNumber(card.pan)}
                        </Typography>
                      </Box>

                      {/* Card Lower Deck Details */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.5,
                              textTransform: 'uppercase',
                              fontSize: '0.65rem',
                              display: 'block',
                              letterSpacing: 0.5,
                            }}
                          >
                            Expiry Date
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                          >
                            {card.expiry_month || 'XX'}/{String(card.expiry_year || 'XX').slice(-2)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.common.white, 0.15),
                            backdropFilter: 'blur(4px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 900, letterSpacing: 0.5 }}
                          >
                            {String(card.currency).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* CONTROL DATA DETAILS LAYER */}
                    <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', display: 'block' }}
                          >
                            Card State
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: isActive ? 'success.main' : 'error.main',
                              }}
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: isActive ? 'success.main' : 'text.secondary',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            >
                              {card.status}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', display: 'block' }}
                          >
                            Card ID
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'text.primary',
                              fontWeight: 600,
                            }}
                          >
                            {card.card_id || '---'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

                      <Button
                        fullWidth
                        variant="soft"
                        color={isActive ? 'primary' : 'inherit'}
                        onClick={() => handleManageCardRoute(card)}
                        endIcon={<Iconify icon="solar:alt-arrow-right-linear" width={16} />}
                        sx={{ fontWeight: 700, py: 1 }}
                      >
                        Manage Account
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}

            {cards.length === 0 && (
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    py: 10,
                    textAlign: 'center',
                    bgcolor: 'transparent',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                  }}
                >
                  <Iconify
                    icon="solar:card-search-bold-duotone"
                    width={64}
                    sx={{ mb: 2, color: 'text.disabled' }}
                  />
                  <Typography variant="h6">No Virtual Cards Found</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    You have not requested any corporate virtual cards yet.
                  </Typography>
                  <Button
                    variant="soft"
                    color="primary"
                    startIcon={<Iconify icon="solar:card-plus-bold-duotone" />}
                    onClick={() => router.push('/dashboard/virtualcard/bridge')}
                  >
                    Issue Card Device Now
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
}

import { useState } from 'react';
import Head from 'next/head';
// @mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
  Alert,
  IconButton,
  alpha,
  useTheme,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import Logo from '../../../components/logo';
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

export default function FlutterwaveCheckoutPage() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TABS = [
    { value: 'card', label: 'Pay with Card', icon: 'eva:credit-card-fill' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'eva:home-fill' },
    { value: 'ussd', label: 'Pay with USSD', icon: 'eva:hash-fill' },
  ];

  const handleIHavePaid = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Verifying payment... Please do not close this window.');
    }, 2000);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 10,
          // Refined background for standalone feel
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
        }}
      >
        <Container maxWidth={themeStretch ? false : 'lg'}>
          {/* Top Header: Merchant Branding */}

          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile
                  minHeight: 520,
                  boxShadow: (theme) => theme.customShadows.z24,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                {/* LEFT SIDEBAR: Payment Methods */}
                <Box
                  sx={{
                    width: { xs: 1, md: 280 },
                    bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.5),
                    borderRight: { md: `1px solid ${theme.palette.divider}` },
                    borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                    p: 3,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.disabled', mb: 2, display: 'block' }}
                  >
                    Select Method
                  </Typography>

                  <Stack spacing={1.5}>
                    {TABS.map((tab) => (
                      <ListItemButton
                        key={tab.value}
                        selected={currentTab === tab.value}
                        onClick={() => setCurrentTab(tab.value)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 1.5,
                          transition: theme.transitions.create('all'),
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            boxShadow: (theme) => theme.customShadows.primary,
                            '& .MuiListItemIcon-root': { color: 'inherit' },
                            '&:hover': { bgcolor: 'primary.dark' },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Iconify icon={tab.icon} width={22} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tab.label}
                          primaryTypographyProps={{ variant: 'subtitle2' }}
                        />
                      </ListItemButton>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 'auto', pt: 10, display: { xs: 'none', md: 'block' } }}>
                    <Paper
                      sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}
                    >
                      <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 'bold' }}>
                        Support?
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
                      >
                        Contact us at support@creddot.com
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* RIGHT CONTENT: Dynamic Views */}
                <Box
                  sx={{
                    flexGrow: 1,
                    p: { xs: 3, md: 5 },
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Amount Section */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 4 }}
                  >
                    <Box>
                      <Typography variant="overline" color="text.disabled">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
                        NGN 50,500.00
                      </Typography>
                    </Box>
                    <Tooltip title="Verified Transaction">
                      <Logo />
                    </Tooltip>
                  </Stack>

                  <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

                  {/* Payment Logic */}
                  <Box sx={{ flexGrow: 1 }}>
                    {currentTab === 'bank_transfer' && (
                      <Stack spacing={3}>
                        <Alert severity="info" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                          Transfer the exact amount to the virtual account below.
                        </Alert>

                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.4),
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                          }}
                        >
                          <Stack spacing={2.5}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Account Number
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography
                                  variant="h5"
                                  sx={{ letterSpacing: 2, fontWeight: 'bold' }}
                                >
                                  0123456789
                                </Typography>
                                <IconButton size="small" color="primary">
                                  <Iconify icon="eva:copy-fill" />
                                </IconButton>
                              </Stack>
                            </Box>

                            <Divider sx={{ borderStyle: 'dotted' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Bank Name
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Wema Bank / ALAT
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Beneficiary
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                PAYLENS - ADETUNJI K.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={1}
                          sx={{ py: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: 'error.main',
                              borderRadius: '50%',
                              animation: 'pulse 1.5s infinite',
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{ fontWeight: 'bold' }}
                          >
                            Session expires in 29:55
                          </Typography>
                        </Stack>

                        <LoadingButton
                          fullWidth
                          size="large"
                          variant="contained"
                          loading={isSubmitting}
                          onClick={handleIHavePaid}
                          sx={{
                            height: 60,
                            fontSize: '1.1rem',
                            boxShadow: (theme) => theme.customShadows.primary,
                          }}
                        >
                          I have made this bank transfer
                        </LoadingButton>
                      </Stack>
                    )}

                    {(currentTab === 'card' || currentTab === 'ussd') && (
                      <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ height: 1, minHeight: 300 }}
                      >
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <Iconify
                            icon="solar:fire-bold-duotone"
                            width={80}
                            sx={{ color: 'warning.main', opacity: 0.2 }}
                          />
                          <Iconify
                            icon="solar:settings-bold-duotone"
                            width={40}
                            sx={{ position: 'absolute', top: 20, left: 20, color: 'warning.main' }}
                          />
                        </Box>
                        <Typography variant="h4">Coming Soon</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ maxWidth: 320 }}
                        >
                          We're building a seamless <b>{currentTab.toUpperCase()}</b> experience for
                          you. Please use Bank Transfer for now.
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* Secure Footer */}
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      mt: 5,
                      pt: 2,
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Iconify
                      icon="logos:stripe"
                      width={40}
                      sx={{ filter: 'grayscale(1)', opacity: 0.3 }}
                    />
                    <Iconify
                      icon="logos:mastercard"
                      width={24}
                      sx={{ filter: 'grayscale(1)', opacity: 0.3 }}
                    />
                    <Iconify
                      icon="logos:visa"
                      width={30}
                      sx={{ filter: 'grayscale(1)', opacity: 0.3 }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 15 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Iconify icon="eva:shield-fill" width={14} /> Secured
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

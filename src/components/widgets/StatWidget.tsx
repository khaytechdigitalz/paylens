/* eslint-disable @typescript-eslint/no-shadow */
import { Card, Typography, Stack, Box, useTheme, alpha, Divider } from '@mui/material';
// utils
import { fCurrency, fShortenNumber } from '../../utils/formatNumber';
// components
import Iconify from '../iconify';

// ----------------------------------------------------------------------

type WidgetVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatWidgetProps {
  title: string;
  amount: string | number;
  isCurrency?: boolean;
  icon: React.ReactNode;
  variant?: WidgetVariant;
}

export default function StatWidget({
  title,
  amount,
  isCurrency,
  icon,
  variant = 'primary',
}: StatWidgetProps) {
  const theme = useTheme();

  const colorMain = theme.palette[variant].main;
  const colorLight = theme.palette[variant].light;

  return (
    <Card
      sx={{
        p: 3,
        width: 1,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: (theme) => `0 8px 24px 0 ${alpha(colorMain, 0.08)}`,
        border: `solid 1px ${alpha(colorMain, 0.12)}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
          colorLight,
          0.05
        )} 100%)`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px 0 ${alpha(colorMain, 0.12)}`,
          transition: theme.transitions.create(['transform', 'box-shadow']),
        },
      }}
    >
      {/* Decorative Background Icon (Watermark Effect) */}
      <Box
        sx={{
          position: 'absolute',
          right: -16,
          bottom: -16,
          zIndex: 0,
          opacity: 0.06,
          transform: 'rotate(-20deg)',
          color: colorMain,
          '& svg': { width: 120, height: 120 },
        }}
      >
        {icon}
      </Box>

      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Enhanced Icon Container */}
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${colorMain} 0%, ${colorLight} 100%)`,
              boxShadow: `0 8px 16px 0 ${alpha(colorMain, 0.24)}`,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {isCurrency ? fCurrency(amount) : fShortenNumber(amount)}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
              Total {title.split(' ')[1] || ''}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', opacity: 0.5 }} />

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography
            variant="overline"
            sx={{
              color: colorMain,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.1,
            }}
          >
            {title}
          </Typography>
          <Iconify icon="eva:chevron-right-fill" width={14} sx={{ color: colorMain }} />
        </Stack>
      </Stack>
    </Card>
  );
}

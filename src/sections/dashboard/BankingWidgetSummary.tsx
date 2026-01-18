/* eslint-disable @typescript-eslint/no-shadow */
import { ApexOptions } from 'apexcharts';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, Typography, Stack, CardProps, Box } from '@mui/material';
import { fCurrency, fPercent } from '../../utils/formatNumber';
import Iconify from '../../components/iconify';
import Chart, { useChart } from '../../components/chart';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent: number;
  icon: string;
  chart: {
    series: number[];
    options?: ApexOptions;
  };
  color?: string; // Optional hex color for the icon circle
}

export default function BankingWidgetSummary({
  title,
  total,
  icon,
  percent,
  chart,
  color = '#004B50', // Default dark teal from your screenshot
  sx,
  ...other
}: Props) {
  const theme = useTheme();
  const { series, options } = chart;

  const isLoss = percent < 0;

  const chartOptions = useChart({
    colors: [color],
    chart: { sparkline: { enabled: true } },
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color, opacity: 0.12 },
          { offset: 100, color, opacity: 0 },
        ],
      },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (value: number) => fCurrency(value),
        title: { formatter: () => '' },
      },
      marker: { show: false },
    },
    ...options,
  });

  return (
    <Card
      sx={{
        p: 3,
        width: 1, // Ensures the card takes 100% of the parent container's width
        boxShadow: 'none',
        borderRadius: 2,
        border: (theme) => `solid 1px ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...other}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 2, width: 1 }} // width: 1 here ensures the inner stack also spreads out
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Circular Icon Container */}
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0, // Prevents the circle from squishing
              display: 'flex',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'common.white',
              bgcolor: color,
            }}
          >
            <Iconify icon={icon} width={24} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {title} <Iconify icon="eva:info-outline" width={14} />
            </Typography>
            <Typography variant="h4">{fCurrency(total)}</Typography>
          </Box>
        </Stack>

        {/* Percentage Pill Badge */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 0.75,
            py: 0.25,
            height: 24,
            borderRadius: 0.75,
            typography: 'subtitle2',
            whiteSpace: 'nowrap', // Prevents percentage from wrapping on small widths
            color: isLoss ? 'error.main' : 'success.main',
            bgcolor: isLoss
              ? alpha(theme.palette.error.main, 0.16)
              : alpha(theme.palette.success.main, 0.16),
          }}
        >
          <Iconify
            icon={isLoss ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
            width={16}
            sx={{ mr: 0.5 }}
          />
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Stack>
      </Stack>

      {/* Chart container set to full width */}
      <Box sx={{ width: 1, mt: 'auto' }}>
        <Chart type="area" series={[{ data: series }]} options={chartOptions} height={60} />
      </Box>
    </Card>
  );
}

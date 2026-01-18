import { ApexOptions } from 'apexcharts';
import { useState } from 'react';
// @mui
import { Card, CardHeader, Box, CardProps } from '@mui/material';
// components
import Chart, { useChart } from '../../components/chart';
import { CustomSmallSelect } from '../../components/custom-input';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[];
    series: {
      type: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

export default function BankingBalanceStatistics({ title, subheader, chart, ...other }: Props) {
  const { categories, colors, series, options } = chart;

  const [seriesData, setSeriesData] = useState('Year');

  const chartOptions = useChart({
    colors,
    // 1. Change stroke from 'transparent' (bar style) to visible line style
    stroke: {
      show: true,
      curve: 'smooth', // Makes the line wavy/modern instead of jagged
      width: 3, // Thicker line for better visibility
    },
    // 2. Remove fill opacity common in bar charts
    fill: {
      type: 'solid',
      opacity: 1,
    },
    xaxis: {
      categories,
      // Optional: Add axis borders for a cleaner look
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    // 3. Markers show points on the line when hovering
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `$${value}`,
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <CustomSmallSelect
            value={seriesData}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSeriesData(event.target.value)
            }
          >
            {series.map((option) => (
              <option key={option.type} value={option.type}>
                {option.type}
              </option>
            ))}
          </CustomSmallSelect>
        }
      />

      {series.map((item) => (
        <Box key={item.type} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.type === seriesData && (
            /* 4. Changed type from "bar" to "line" */
            <Chart type="line" series={item.data} options={chartOptions} height={364} />
          )}
        </Box>
      ))}
    </Card>
  );
}

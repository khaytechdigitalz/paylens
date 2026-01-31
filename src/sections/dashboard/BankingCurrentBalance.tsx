/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
import { useState } from 'react';
// @mui
import { styled, useTheme, Theme } from '@mui/material/styles';
import { Box, Typography, Stack, IconButton, SxProps, alpha } from '@mui/material';
// utils
import { bgGradient } from '../../utils/cssStyles';
import { fCurrency } from '../../utils/formatNumber';
// components
import Iconify from '../../components/iconify';
import Carousel, { CarouselDots } from '../../components/carousel';

// ----------------------------------------------------------------------

const HEIGHT = 276;

const StyledRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  height: HEIGHT,
  '& .slick-list': {
    borderRadius: Number(theme.shape.borderRadius) * 2,
  },
}));

const StyledCard = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.grey[900], 0.9),
    imgUrl: '/assets/background/overlay_2.jpg',
  }),
  position: 'relative',
  height: HEIGHT - 16,
  padding: theme.spacing(3),
  backgroundRepeat: 'no-repeat',
  color: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const shadowStyle = {
  mx: 'auto',
  width: 'calc(100% - 16px)',
  borderRadius: 2,
  position: 'absolute',
  height: 200,
  zIndex: 8,
  bottom: 8,
  left: 0,
  right: 0,
  bgcolor: 'grey.500',
  opacity: 0.32,
} as const;

// ----------------------------------------------------------------------

type ItemProps = {
  id: string;
  cardType: string;
  balance: number;
  currency: string;
  symbol: string;
  wallet_type: string;
  wallet_address: string;
};

type Props = {
  list: ItemProps[];
  sx?: SxProps<Theme>;
};

export default function BankingCurrentBalance({ list, sx }: Props) {
  const theme = useTheme();

  const carouselSettings = {
    dots: true,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    rtl: Boolean(theme.direction === 'rtl'),
    ...CarouselDots({
      sx: {
        right: 16,
        bottom: 16,
        position: 'absolute',
      },
    }),
  };

  return (
    <StyledRoot sx={sx}>
      <Box sx={{ position: 'relative', zIndex: 9 }}>
        <Carousel {...carouselSettings}>
          {list.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </Carousel>
      </Box>

      <Box sx={{ ...shadowStyle }} />

      <Box
        sx={{
          ...shadowStyle,
          opacity: 0.16,
          bottom: 0,
          zIndex: 7,
          width: 'calc(100% - 40px)',
        }}
      />
    </StyledRoot>
  );
}

// ----------------------------------------------------------------------

type CardItemProps = {
  card: ItemProps;
};

function CardItem({ card }: CardItemProps) {
  const { balance, wallet_type, wallet_address, symbol, currency } = card;
    
  const [showCurrency, setShowCurrency] = useState(false);

  const handleShowCurrency = () => {
    setShowCurrency(!showCurrency);
  };
 
  return ( 
      <StyledCard>

        <div>
          <Typography sx={{ mb: 2, typography: 'subtitle2', opacity: 0.72 }}>
            Current Balance
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ typography: 'h3' }}>
              {symbol} {showCurrency ? '********' : fCurrency(balance)}
            </Typography>

            <IconButton color="inherit" onClick={handleShowCurrency} sx={{ opacity: 0.48 }}>
              <Iconify icon={showCurrency ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
            </IconButton>
          </Stack>
        </div>

        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
           

          <Typography sx={{ typography: 'subtitle1', textAlign: 'right' }}>
            {wallet_address}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={5}>
          <div>
            <Typography sx={{ mb: 1, typography: 'caption', opacity: 0.48 }}>
              Type
            </Typography>

            <Typography sx={{ typography: 'Wallet Type' }}>{wallet_type}</Typography>
          </div>

          <div>
            <Typography sx={{ mb: 1, typography: 'caption', opacity: 0.48 }}>
              Currency
            </Typography>

            <Typography sx={{ typography: 'Wallet ID' }}>{currency}</Typography>
          </div>
        </Stack>
      </StyledCard>
  );
}

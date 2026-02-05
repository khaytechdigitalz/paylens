import { useState } from 'react';
import { useRouter } from 'next/router';
// @mui
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  Stack,
  Container,
  Link,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  InputBase,
} from '@mui/material';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Overview', href: '/documentation/overview' },
  { label: 'Initialize', href: '/documentation/initialize' },
  { label: 'Verify', href: '/documentation/verify' },
  { label: 'Payout', href: '/documentation/payout' },
  { label: 'Webhooks', href: '/documentation/webhooks' },
  { label: 'Error Codes', href: '/documentation/errorcode' },
  { label: 'Go-Live', href: '/documentation/golive' },
];

const StyledHeaderRoot = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: theme.zIndex.appBar,
  width: '100%',
  display: 'flex',
  position: 'sticky',
  backgroundColor: alpha(theme.palette.background.default, 0.9),
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: 14,
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StyledNavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active, theme }) => ({
  ...theme.typography.caption,
  fontWeight: active ? 700 : 600,
  cursor: 'pointer',
  textDecoration: 'none !important',
  padding: theme.spacing(0.8, 1.2),
  borderRadius: theme.shape.borderRadius,
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  whiteSpace: 'nowrap',
  transition: theme.transitions.create(['color', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// ----------------------------------------------------------------------

export default function ApiDocsHeader() {
  const theme = useTheme();
  const { pathname, push } = useRouter();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <StyledHeaderRoot>
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: { xs: 64, md: 80 } }}
        >
          {/* LEFT: LOGO & SEARCH */}
          <Stack direction="row" alignItems="center" flexGrow={1}>
            <Logo />

            <Search sx={{ display: { xs: 'none', md: 'block' } }}>
              <SearchIconWrapper>
                <Iconify icon="solar:magnifer-linear" width={18} />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search docs..."
                inputProps={{ 'aria-label': 'search' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 7,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 0.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  typography: 'caption',
                  color: 'text.disabled',
                }}
              >
                ⌘K
              </Box>
            </Search>
          </Stack>

          {/* CENTER/RIGHT: DESKTOP MENU */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ display: { xs: 'none', lg: 'flex' }, mr: 3 }}
          >
            {NAV_ITEMS.map((item) => (
              <StyledNavItem
                key={item.label}
                active={pathname === item.href}
                onClick={() => push(item.href)}
              >
                {item.label}
              </StyledNavItem>
            ))}
          </Stack>

          {/* RIGHT: VERSION & ACTIONS */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: 0.5,
                typography: 'caption',
                fontWeight: 800,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                display: { xs: 'none', sm: 'block' },
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              v1.0
            </Box>

            <IconButton
              onClick={() => setOpenMobileMenu(true)}
              sx={{
                display: { lg: 'none' },
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:menu-dots-bold" />
            </IconButton>
          </Stack>
        </Stack>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={openMobileMenu}
        onClose={() => setOpenMobileMenu(false)}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Logo />
          <IconButton onClick={() => setOpenMobileMenu(false)}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </Stack>

        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  push(item.href);
                  setOpenMobileMenu(false);
                }}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </StyledHeaderRoot>
  );
}

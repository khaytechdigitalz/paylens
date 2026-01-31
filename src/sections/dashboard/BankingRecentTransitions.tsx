import { format } from 'date-fns';
import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Table,
  Avatar,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
} from '@mui/material';
// utils
import { fCurrency } from '../../utils/formatNumber';
// components
import Label from '../../components/label';
import Iconify, { IconifyProps } from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { TableHeadCustom } from '../../components/table';

// ----------------------------------------------------------------------

// Exporting this so you can use it in your Dashboard state:
// const [transactions, setTransactions] = useState<RowProps[]>([]);
export type RowProps = {
  id: number;
  reference: string;
  amount: string | number;
  type: string;
  category: string;
  status: string;
  created_at: string;
  description: string;
  currency?: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function BankingRecentTransitions({
  title,
  subheader,
  tableLabels,
  tableData,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar sx={{ minWidth: 720 }}>
          <Table>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData &&
                tableData.map((row) => <BankingRecentTransitionsRow key={row.id} row={row} />)}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type BankingRecentTransitionsRowProps = {
  row: RowProps;
};

function BankingRecentTransitionsRow({ row }: BankingRecentTransitionsRowProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  // Safety check for Date
  const dateValue = row.created_at ? new Date(row.created_at) : new Date();

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            {renderAvatar(row.category)}
            <Box
              sx={{
                right: 0,
                bottom: 0,
                width: 18,
                height: 18,
                display: 'flex',
                borderRadius: '50%',
                position: 'absolute',
                alignItems: 'center',
                color: 'common.white',
                bgcolor: 'error.main',
                justifyContent: 'center',
                ...(row.type === 'credit' && {
                  bgcolor: 'success.main',
                }),
              }}
            >
              <Iconify
                icon={
                  row.type === 'credit'
                    ? 'eva:diagonal-arrow-left-down-fill'
                    : 'eva:diagonal-arrow-right-up-fill'
                }
                width={16}
              />
            </Box>
          </Box>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {row.description}
            </Typography>
            <Typography variant="subtitle2"> {row.reference}</Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2">{format(dateValue, 'dd MMM yyyy')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {format(dateValue, 'p')}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2">
          {row.currency || ''} {fCurrency(row.amount)}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant={isLight ? 'soft' : 'filled'}
          color={
            (row.status === 'success' && 'success') ||
            (row.status === 'pending' && 'warning') ||
            'error'
          }
        >
          {sentenceCase(row.status)}
        </Label>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

function AvatarIcon({ icon }: { icon: string }) {
  return (
    <Avatar
      sx={{
        width: 48,
        height: 48,
        color: 'text.secondary',
        bgcolor: 'background.neutral',
      }}
    >
      <Iconify icon={icon} width={24} />
    </Avatar>
  );
}

function renderAvatar(category: string) {
  const cat = category.toLowerCase();

  if (cat === 'airtime') {
    return <AvatarIcon icon="solar:phone-calling-bold-duotone" />;
  }
  if (cat === 'transfer' || cat === 'debit') {
    return <AvatarIcon icon="eva:diagonal-arrow-right-up-fill" />;
  }

  return (
    <Avatar
      alt={category}
      sx={{
        width: 48,
        height: 48,
        bgcolor: 'primary.lighter',
        color: 'primary.darker',
        fontWeight: 'bold',
      }}
    >
      {category.charAt(0).toUpperCase()}
    </Avatar>
  );
}

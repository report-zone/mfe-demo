import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useI18n } from '@mfe-demo/shared-hooks';

const App: React.FC = () => {
  const { t } = useI18n();

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
          <Typography variant="h4" component="h1">
            {t('admin.title')}
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('admin.warning')}
        </Alert>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('admin.description')}
        </Typography>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.table.id')}</TableCell>
              <TableCell>{t('admin.table.name')}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('admin.table.email')}</TableCell>
              <TableCell>{t('admin.table.role')}</TableCell>
              <TableCell>{t('admin.table.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `admin.table.${user.role === 'Admin' ? 'adminRole' : 'userRole'}`
                    )}
                    color={user.role === 'Admin' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(
                      `admin.table.${user.status === 'Active' ? 'active' : 'inactive'}`
                    )}
                    color={user.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default App;

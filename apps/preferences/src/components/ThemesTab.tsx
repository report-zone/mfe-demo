import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Snackbar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useThemeContext } from '../context/ThemeContext';
import { CustomThemeDefinition } from '../types/theme.types';
import ThemeEditorDialog from './ThemeEditorDialog';
import ComponentShowcase from './ComponentShowcase';

const ThemesTab: React.FC = () => {
  const { themes, setTheme, currentTheme, addCustomTheme, loadThemesFromStorage, removeCustomTheme } =
    useThemeContext();
  const [editorOpen, setEditorOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

  const handleCreateTheme = () => {
    setEditorOpen(true);
  };

  const handleLoadAndAddTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const result = event.target?.result;
            if (typeof result === 'string') {
              const config: CustomThemeDefinition = JSON.parse(result);
              
              // Convert CustomThemeDefinition to MUI theme
              const muiTheme = createTheme({
                palette: {
                  mode: config.palette?.mode || 'light',
                  primary: {
                    main: config.colors?.primaryMain || '#1976d2',
                    light: config.colors?.primaryLight || '#42a5f5',
                    dark: config.colors?.primaryDark || '#1565c0',
                  },
                  secondary: {
                    main: config.colors?.secondaryMain || '#dc004e',
                    light: config.colors?.secondaryLight || '#ff4081',
                    dark: config.colors?.secondaryDark || '#9a0036',
                  },
                  error: {
                    main: config.colors?.errorMain || '#d32f2f',
                  },
                  warning: {
                    main: config.colors?.warningMain || '#ed6c02',
                  },
                  info: {
                    main: config.colors?.infoMain || '#0288d1',
                  },
                  success: {
                    main: config.colors?.successMain || '#2e7d32',
                  },
                  background: {
                    default: config.colors?.backgroundDefault || '#ffffff',
                    paper: config.colors?.backgroundPaper || '#f5f5f5',
                  },
                  text: {
                    primary: config.colors?.textPrimary || '#000000',
                    secondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
                  },
                },
                typography: {
                  fontSize: config.componentOverrides?.typography?.bodyFontSize || 16,
                  h1: {
                    fontSize: `${config.componentOverrides?.typography?.h1FontSize || 96}px`,
                  },
                  h2: {
                    fontSize: `${config.componentOverrides?.typography?.h2FontSize || 60}px`,
                  },
                  h3: {
                    fontSize: `${config.componentOverrides?.typography?.h3FontSize || 48}px`,
                  },
                  body1: {
                    fontSize: `${config.componentOverrides?.typography?.bodyFontSize || 16}px`,
                  },
                },
                shape: {
                  borderRadius: config.componentOverrides?.button?.borderRadius || 4,
                },
                components: config.muiComponentOverrides || {},
              });
              
              const theme = {
                id: `loaded-${Date.now()}`,
                name: config.name || file.name.replace('.json', ''),
                description: config.description || '',
                theme: muiTheme,
                isCustom: true,
                themeConfig: config,
              };
              addCustomTheme(theme);
              loadThemesFromStorage();
              setSnackbar({ open: true, message: 'Theme loaded and added to selection!', severity: 'success' });
            }
          } catch (error) {
            setSnackbar({ open: true, message: 'Error loading theme file. Please ensure it is a valid JSON file.', severity: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDeleteTheme = (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this custom theme?')) {
      removeCustomTheme(themeId);
      loadThemesFromStorage();
      setSnackbar({ open: true, message: 'Theme deleted successfully!', severity: 'success' });
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Themes</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTheme}
            >
              Create Custom Theme
            </Button>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleLoadAndAddTheme}>
              Load Custom Theme
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Choose from default themes or create your own custom theme.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Theme
          </Typography>
          <RadioGroup
            value={currentTheme.id}
            onChange={(e) => {
              const theme = themes.find((t) => t.id === e.target.value);
              if (theme) setTheme(theme);
            }}
          >
            {themes.map((theme) => (
              <Box
                key={theme.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: theme.id !== themes[themes.length - 1].id ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <FormControlLabel
                  value={theme.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {theme.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {theme.isCustom ? 'Custom Theme' : 'Default Theme'}
                      </Typography>
                    </Box>
                  }
                  sx={{ flex: 1 }}
                />
                {theme.description && (
                  <Tooltip title={theme.description} placement="left">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {theme.isCustom && (
                  <Tooltip title="Delete custom theme" placement="left">
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }} 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTheme(theme.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </RadioGroup>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <ComponentShowcase />
        </Box>
      </Paper>

      <ThemeEditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThemesTab;

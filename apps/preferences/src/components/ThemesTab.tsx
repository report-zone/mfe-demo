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
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useThemeContext } from '../context/ThemeContext';
import { CustomThemeDefinition } from '../types/theme.types';
import ThemeEditorDialog from './ThemeEditorDialog';
import ComponentShowcase from './ComponentShowcase';
import { convertThemeDefinitionToMuiTheme } from '../utils/themeUtils';
import { loadThemeFromFile } from '../utils/themeFileOperations';

const ThemesTab: React.FC = () => {
  const { themes, setTheme, currentTheme, addCustomTheme, loadThemesFromStorage, removeCustomTheme } =
    useThemeContext();
  const [editorOpen, setEditorOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

  const handleCreateTheme = () => {
    setEditorOpen(true);
  };

  const handleLoadAndAddTheme = async () => {
    try {
      const config: CustomThemeDefinition = await loadThemeFromFile();
      
      // Convert CustomThemeDefinition to MUI theme using utility
      const muiTheme = convertThemeDefinitionToMuiTheme(config);
      
      const theme = {
        id: `loaded-${Date.now()}`,
        name: config.name,
        description: config.description || '',
        theme: muiTheme,
        isCustom: true,
        themeConfig: config,
      };
      addCustomTheme(theme);
      loadThemesFromStorage();
      setSnackbar({ open: true, message: 'Theme loaded and added to selection!', severity: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading theme file';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
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

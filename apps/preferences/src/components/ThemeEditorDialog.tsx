import React, { useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog as ConfirmDialog,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import Editor from '@monaco-editor/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ColorPicker from './ColorPicker';
import { ThemeEditorState } from '../types/theme.types';
import { useThemeContext } from '../context/ThemeContext';

interface ThemeEditorDialogProps {
  open: boolean;
  onClose: () => void;
  initialTheme?: ThemeEditorState;
}

const ThemeEditorDialog: React.FC<ThemeEditorDialogProps> = ({ open, onClose, initialTheme }) => {
  const { addCustomTheme } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [jsonError, setJsonError] = useState<string>('');
  const [monacoSettings, setMonacoSettings] = useState({ theme: 'vs-light' });
  const [showMonacoSettings, setShowMonacoSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [confirmClose, setConfirmClose] = useState(false);

  const [editorState, setEditorState] = useState<ThemeEditorState>(
    initialTheme || {
      name: 'Custom Theme',
      description: '',
      primary: '#1976d2',
      primaryLight: '#42a5f5',
      primaryDark: '#1565c0',
      secondary: '#dc004e',
      secondaryLight: '#f73378',
      secondaryDark: '#9a0036',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1',
      success: '#2e7d32',
      background: '#ffffff',
      paper: '#ffffff',
      mode: 'light',
      borderRadius: 4,
      fontSize: 14,
      padding: 8,
      h1FontSize: '2.5rem',
      h2FontSize: '2rem',
      h3FontSize: '1.75rem',
      h4FontSize: '1.5rem',
      jsonConfig: JSON.stringify({
        palette: {
          primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
          secondary: { main: '#dc004e', light: '#f73378', dark: '#9a0036' },
        },
        shape: { borderRadius: 4 },
        typography: {
          fontSize: 14,
          h1: { fontSize: '2.5rem' },
          h2: { fontSize: '2rem' },
          h3: { fontSize: '1.75rem' },
          h4: { fontSize: '1.5rem' },
        },
        spacing: 8,
      }, null, 2),
    }
  );

  // Generate theme from editor state
  const generateTheme = () => {
    try {
      const baseTheme = {
        palette: {
          mode: editorState.mode,
          primary: {
            main: editorState.primary,
            light: editorState.primaryLight,
            dark: editorState.primaryDark,
          },
          secondary: {
            main: editorState.secondary,
            light: editorState.secondaryLight,
            dark: editorState.secondaryDark,
          },
          error: {
            main: editorState.error,
          },
          warning: {
            main: editorState.warning,
          },
          info: {
            main: editorState.info,
          },
          success: {
            main: editorState.success,
          },
          background: {
            default: editorState.background,
            paper: editorState.paper,
          },
        },
        shape: {
          borderRadius: editorState.borderRadius || 4,
        },
        typography: {
          fontSize: editorState.fontSize || 14,
          h1: {
            fontSize: editorState.h1FontSize || '2.5rem',
          },
          h2: {
            fontSize: editorState.h2FontSize || '2rem',
          },
          h3: {
            fontSize: editorState.h3FontSize || '1.75rem',
          },
          h4: {
            fontSize: editorState.h4FontSize || '1.5rem',
          },
        },
        spacing: editorState.padding || 8,
      };

      // Try to merge with JSON config
      let mergedConfig = baseTheme;
      if (editorState.jsonConfig && editorState.jsonConfig !== '{}') {
        try {
          const jsonConfig = JSON.parse(editorState.jsonConfig);
          mergedConfig = { ...baseTheme, ...jsonConfig };
        } catch (e) {
          console.warn('Invalid JSON config, using base theme');
        }
      }

      return createTheme(mergedConfig);
    } catch (error) {
      console.error('Error generating theme:', error);
      return createTheme();
    }
  };

  const previewTheme = generateTheme();

  const handleFieldChange = (field: keyof ThemeEditorState, value: string) => {
    // Convert numeric string values to numbers for appropriate fields
    let processedValue: string | number = value;
    if (field === 'borderRadius' || field === 'fontSize' || field === 'padding') {
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? 0 : numValue;
    }
    setEditorState((prev) => ({ ...prev, [field]: processedValue }));
    setHasUnsavedChanges(true);
  };

  const handleJsonChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorState((prev) => ({ ...prev, jsonConfig: value }));
      setHasUnsavedChanges(true);

      // Validate JSON
      try {
        JSON.parse(value);
        setJsonError('');
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      }
    }
  };

  const handleSave = () => {
    if (jsonError) {
      setSnackbar({ open: true, message: 'Please fix JSON errors before saving', severity: 'error' });
      return;
    }

    const theme = generateTheme();
    addCustomTheme({
      id: `custom-${Date.now()}`,
      name: editorState.name,
      description: editorState.description,
      theme,
      isCustom: true,
      themeConfig: theme,
    });

    setHasUnsavedChanges(false);
    setSnackbar({ open: true, message: 'Theme saved successfully!', severity: 'success' });
    setTimeout(() => onClose(), 1000);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setConfirmClose(false);
    onClose();
  };

  const handleLoadTheme = () => {
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
              const config = JSON.parse(result);
              setEditorState({
                name: config.name || 'Loaded Theme',
                description: config.description || '',
                primary: config.palette?.primary?.main || '#1976d2',
                primaryLight: config.palette?.primary?.light || '#42a5f5',
                primaryDark: config.palette?.primary?.dark || '#1565c0',
                secondary: config.palette?.secondary?.main || '#dc004e',
                secondaryLight: config.palette?.secondary?.light || '#f73378',
                secondaryDark: config.palette?.secondary?.dark || '#9a0036',
                error: config.palette?.error?.main || '#d32f2f',
                warning: config.palette?.warning?.main || '#ed6c02',
                info: config.palette?.info?.main || '#0288d1',
                success: config.palette?.success?.main || '#2e7d32',
                background: config.palette?.background?.default || '#ffffff',
                paper: config.palette?.background?.paper || '#ffffff',
                mode: config.palette?.mode || 'light',
                borderRadius: config.shape?.borderRadius || 4,
                fontSize: config.typography?.fontSize || 14,
                padding: config.spacing || 8,
                h1FontSize: config.typography?.h1?.fontSize || '2.5rem',
                h2FontSize: config.typography?.h2?.fontSize || '2rem',
                h3FontSize: config.typography?.h3?.fontSize || '1.75rem',
                h4FontSize: config.typography?.h4?.fontSize || '1.5rem',
                jsonConfig: JSON.stringify(config, null, 2),
              });
              setHasUnsavedChanges(true);
              setSnackbar({ open: true, message: 'Theme loaded successfully!', severity: 'success' });
            }
          } catch (error) {
            setSnackbar({ open: true, message: 'Error loading theme file', severity: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Theme Editor
          </Typography>
          <Button color="inherit" startIcon={<UploadFileIcon />} onClick={handleLoadTheme}>
            Load Theme
          </Button>
          <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Theme Name"
          value={editorState.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Theme Description"
          value={editorState.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          multiline
          rows={2}
          placeholder="Describe your theme..."
          sx={{ mb: 3 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
              <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable">
                <Tab label="Primary" />
                <Tab label="Secondary" />
                <Tab label="Status" />
                <Tab label="Background" />
                <Tab label="Components" />
                <Tab label="Advanced JSON" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <ColorPicker
                      label="Primary Main"
                      value={editorState.primary}
                      onChange={(v) => handleFieldChange('primary', v)}
                    />
                    <ColorPicker
                      label="Primary Light"
                      value={editorState.primaryLight || '#42a5f5'}
                      onChange={(v) => handleFieldChange('primaryLight', v)}
                    />
                    <ColorPicker
                      label="Primary Dark"
                      value={editorState.primaryDark || '#1565c0'}
                      onChange={(v) => handleFieldChange('primaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <ColorPicker
                      label="Secondary Main"
                      value={editorState.secondary}
                      onChange={(v) => handleFieldChange('secondary', v)}
                    />
                    <ColorPicker
                      label="Secondary Light"
                      value={editorState.secondaryLight || '#f73378'}
                      onChange={(v) => handleFieldChange('secondaryLight', v)}
                    />
                    <ColorPicker
                      label="Secondary Dark"
                      value={editorState.secondaryDark || '#9a0036'}
                      onChange={(v) => handleFieldChange('secondaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <ColorPicker
                      label="Error Color"
                      value={editorState.error}
                      onChange={(v) => handleFieldChange('error', v)}
                    />
                    <ColorPicker
                      label="Warning Color"
                      value={editorState.warning}
                      onChange={(v) => handleFieldChange('warning', v)}
                    />
                    <ColorPicker
                      label="Info Color"
                      value={editorState.info}
                      onChange={(v) => handleFieldChange('info', v)}
                    />
                    <ColorPicker
                      label="Success Color"
                      value={editorState.success}
                      onChange={(v) => handleFieldChange('success', v)}
                    />
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <ColorPicker
                      label="Background Color"
                      value={editorState.background}
                      onChange={(v) => handleFieldChange('background', v)}
                    />
                    <ColorPicker
                      label="Paper Color"
                      value={editorState.paper}
                      onChange={(v) => handleFieldChange('paper', v)}
                    />
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Component Configuration
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      General Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Border Radius (px)"
                      value={editorState.borderRadius || 4}
                      onChange={(e) => handleFieldChange('borderRadius', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Base Font Size (px)"
                      value={editorState.fontSize || 14}
                      onChange={(e) => handleFieldChange('fontSize', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Spacing Unit (px)"
                      value={editorState.padding || 8}
                      onChange={(e) => handleFieldChange('padding', e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Typography Overrides
                    </Typography>
                    <TextField
                      fullWidth
                      label="H1 Font Size"
                      value={editorState.h1FontSize || '2.5rem'}
                      onChange={(e) => handleFieldChange('h1FontSize', e.target.value)}
                      placeholder="e.g., 2.5rem, 40px"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="H2 Font Size"
                      value={editorState.h2FontSize || '2rem'}
                      onChange={(e) => handleFieldChange('h2FontSize', e.target.value)}
                      placeholder="e.g., 2rem, 32px"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="H3 Font Size"
                      value={editorState.h3FontSize || '1.75rem'}
                      onChange={(e) => handleFieldChange('h3FontSize', e.target.value)}
                      placeholder="e.g., 1.75rem, 28px"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="H4 Font Size"
                      value={editorState.h4FontSize || '1.5rem'}
                      onChange={(e) => handleFieldChange('h4FontSize', e.target.value)}
                      placeholder="e.g., 1.5rem, 24px"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      For more advanced component overrides, use the Advanced JSON tab.
                    </Typography>
                  </Box>
                )}

                {activeTab === 5 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Advanced JSON Configuration</Typography>
                      <IconButton onClick={() => setShowMonacoSettings(!showMonacoSettings)}>
                        <SettingsIcon />
                      </IconButton>
                    </Box>

                    {showMonacoSettings && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setMonacoSettings({
                              theme: monacoSettings.theme === 'vs-light' ? 'vs-dark' : 'vs-light',
                            })
                          }
                        >
                          Toggle Theme ({monacoSettings.theme})
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                      <Editor
                        height="400px"
                        language="json"
                        value={editorState.jsonConfig}
                        onChange={handleJsonChange}
                        theme={monacoSettings.theme}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </Box>

                    {jsonError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {jsonError}
                      </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Use this editor to provide detailed component overrides and advanced theme
                      configurations.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Live Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <ThemeProvider theme={previewTheme}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    Theme Preview
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    This preview shows how your theme will look in the application.
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary">
                      Primary
                    </Button>
                    <Button variant="contained" color="secondary">
                      Secondary
                    </Button>
                    <Button variant="outlined">Outlined</Button>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <TextField fullWidth label="Text Field" />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Alert severity="success">Success Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="error">Error Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning">Warning Alert</Alert>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info">Info Alert</Alert>
                  </Box>
                </Box>
              </ThemeProvider>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Confirm Close Dialog */}
      <ConfirmDialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to close without saving?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Cancel</Button>
          <Button onClick={handleConfirmClose} color="error" variant="contained">
            Close Without Saving
          </Button>
        </DialogActions>
      </ConfirmDialog>

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
    </Dialog>
  );
};

export default ThemeEditorDialog;

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

  const [editorState, setEditorState] = useState<ThemeEditorState>(
    initialTheme || {
      name: 'Custom Theme',
      primary: '#1976d2',
      secondary: '#dc004e',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1',
      success: '#2e7d32',
      background: '#ffffff',
      paper: '#ffffff',
      mode: 'light',
      jsonConfig: '{}',
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
          },
          secondary: {
            main: editorState.secondary,
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
    setEditorState((prev) => ({ ...prev, [field]: value }));
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
      } catch (e: any) {
        setJsonError(e.message);
      }
    }
  };

  const handleSave = () => {
    if (jsonError) {
      alert('Please fix JSON errors before saving');
      return;
    }

    const theme = generateTheme();
    addCustomTheme({
      id: `custom-${Date.now()}`,
      name: editorState.name,
      theme,
      isCustom: true,
      themeConfig: theme,
    });

    setHasUnsavedChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleLoadTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const config = JSON.parse(event.target.result);
            setEditorState({
              name: config.name || 'Loaded Theme',
              primary: config.palette?.primary?.main || '#1976d2',
              secondary: config.palette?.secondary?.main || '#dc004e',
              error: config.palette?.error?.main || '#d32f2f',
              warning: config.palette?.warning?.main || '#ed6c02',
              info: config.palette?.info?.main || '#0288d1',
              success: config.palette?.success?.main || '#2e7d32',
              background: config.palette?.background?.default || '#ffffff',
              paper: config.palette?.background?.paper || '#ffffff',
              mode: config.palette?.mode || 'light',
              jsonConfig: JSON.stringify(config, null, 2),
            });
            setHasUnsavedChanges(true);
          } catch (error) {
            alert('Error loading theme file');
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
                  <ColorPicker
                    label="Primary Color"
                    value={editorState.primary}
                    onChange={(v) => handleFieldChange('primary', v)}
                  />
                )}

                {activeTab === 1 && (
                  <ColorPicker
                    label="Secondary Color"
                    value={editorState.secondary}
                    onChange={(v) => handleFieldChange('secondary', v)}
                  />
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
                      Component Overrides
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Use the Advanced JSON tab to add component overrides.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Common Component Names:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2">
                          Action: MuiButton, MuiIconButton, MuiFab, MuiButtonGroup
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Input: MuiTextField, MuiInput, MuiCheckbox, MuiRadio, MuiSwitch
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Navigation: MuiAppBar, MuiDrawer, MuiTabs, MuiTab
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Data Display: MuiTypography, MuiCard, MuiChip, MuiList
                        </Typography>
                      </li>
                    </ul>
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
    </Dialog>
  );
};

export default ThemeEditorDialog;

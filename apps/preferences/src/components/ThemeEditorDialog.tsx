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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Editor from '@monaco-editor/react';
import { ThemeProvider } from '@mui/material/styles';
import ColorPicker from './ColorPicker';
import ComponentShowcase from './ComponentShowcase';
import { CustomThemeDefinition } from '../types/theme.types';
import {
  createDefaultThemeDefinition,
  convertThemeDefinitionToMuiTheme,
  bumpVersion,
  cloneThemeDefinition,
  validateThemeDefinition,
} from '../utils/themeUtils';
import {
  sanitizeFilename,
  downloadThemeAsFile,
  loadThemeFromFile,
  isFilenameSavedInSession,
  trackSavedFilename,
} from '../utils/themeFileOperations';

interface ThemeEditorDialogProps {
  open: boolean;
  onClose: () => void;
  initialTheme?: CustomThemeDefinition;
}



const ThemeEditorDialog: React.FC<ThemeEditorDialogProps> = ({ open, onClose, initialTheme }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [themeJsonError, setThemeJsonError] = useState<string>('');
  const [monacoSettings, setMonacoSettings] = useState({ theme: 'vs-light' });
  const [showMonacoSettings, setShowMonacoSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [confirmClose, setConfirmClose] = useState(false);
  const [livePreviewExpanded, setLivePreviewExpanded] = useState(false);

  const [themeDefinition, setThemeDefinition] = useState<CustomThemeDefinition>(createDefaultThemeDefinition());
  const [isEditingExistingTheme, setIsEditingExistingTheme] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ filename: string; themeDefinition: CustomThemeDefinition } | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFilename, setNewFilename] = useState('');

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      const initialDefinition = initialTheme || createDefaultThemeDefinition();
      setThemeDefinition(initialDefinition);
      setActiveTab(0);
      setHasUnsavedChanges(false);
      setThemeJsonError('');
      setLivePreviewExpanded(false);
      setIsEditingExistingTheme(!!initialTheme);
    }
  }, [open, initialTheme]);

  // Generate theme from definition for live preview
  const previewTheme = React.useMemo(() => {
    try {
      return convertThemeDefinitionToMuiTheme(themeDefinition);
    } catch (error) {
      console.error('Error generating preview theme:', error);
      return convertThemeDefinitionToMuiTheme(createDefaultThemeDefinition());
    }
  }, [themeDefinition]);

  const updateThemeDefinition = (updates: Partial<CustomThemeDefinition> | ((prev: CustomThemeDefinition) => CustomThemeDefinition)) => {
    setThemeDefinition(prev => {
      const updated = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleColorChange = (path: string, value: string) => {
    const keys = path.split('.');
    updateThemeDefinition(prev => {
      const updated = cloneThemeDefinition(prev);
      
      // Type-safe navigation through the nested structure
      if (keys[0] === 'colors' && keys.length === 2) {
        const colorKey = keys[1] as keyof CustomThemeDefinition['colors'];
        updated.colors[colorKey] = value;
      }
      
      return updated;
    });
  };

  const handleComponentOverrideChange = (component: string, property: string, value: string | number) => {
    updateThemeDefinition(prev => {
      const updated = cloneThemeDefinition(prev);
      
      // Type-safe component override updates
      type ComponentKey = keyof CustomThemeDefinition['componentOverrides'];
      const componentKey = component as ComponentKey;
      
      if (!updated.componentOverrides[componentKey]) {
        updated.componentOverrides[componentKey] = {} as Record<string, string | number>;
      }
      
      const componentOverride = updated.componentOverrides[componentKey];
      if (componentOverride) {
        (componentOverride as Record<string, string | number>)[property] = value;
      }
      
      return updated;
    });
  };

  const handleFullThemeJsonChange = (value: string | undefined) => {
    if (value !== undefined) {
      setHasUnsavedChanges(true);

      try {
        const parsed = JSON.parse(value) as CustomThemeDefinition;
        const validation = validateThemeDefinition(parsed);
        
        if (validation.isValid) {
          setThemeDefinition(parsed);
          setThemeJsonError('');
        } else {
          setThemeJsonError(validation.error || 'Invalid theme format');
        }
      } catch (e) {
        setThemeJsonError(e instanceof Error ? e.message : 'Invalid JSON syntax');
      }
    }
  };

  const handleSave = () => {
    if (themeJsonError) {
      setSnackbar({ open: true, message: 'Please fix JSON errors before saving', severity: 'error' });
      return;
    }

    const finalDefinition = isEditingExistingTheme 
      ? { ...cloneThemeDefinition(themeDefinition), version: bumpVersion(themeDefinition.version) }
      : cloneThemeDefinition(themeDefinition);
    
    if (isEditingExistingTheme) {
      setThemeDefinition(finalDefinition);
    }

    const filename = `${sanitizeFilename(finalDefinition.name)}.json`;
    
    if (isFilenameSavedInSession(filename)) {
      setPendingSave({ filename, themeDefinition: finalDefinition });
      setShowOverwriteDialog(true);
      return;
    }

    performSave(filename, finalDefinition);
  };

  const performSave = (filename: string, definition: CustomThemeDefinition) => {
    downloadThemeAsFile(definition, filename);
    trackSavedFilename(filename);
    setHasUnsavedChanges(false);
    setSnackbar({ open: true, message: 'Theme saved to file system!', severity: 'success' });
    setTimeout(() => onClose(), 1000);
  };

  const handleOverwriteConfirm = () => {
    if (pendingSave) {
      performSave(pendingSave.filename, pendingSave.themeDefinition);
      setPendingSave(null);
      setShowOverwriteDialog(false);
    }
  };

  const handleOverwriteRename = () => {
    setShowOverwriteDialog(false);
    if (pendingSave) {
      const baseFilename = pendingSave.filename.replace(/\.json$/, '');
      setNewFilename(baseFilename);
      setShowRenameDialog(true);
    }
  };

  const handleRenameConfirm = () => {
    if (!newFilename.trim()) {
      setSnackbar({ open: true, message: 'Please enter a filename', severity: 'error' });
      return;
    }

    if (pendingSave) {
      const sanitized = sanitizeFilename(newFilename.trim());
      const filename = sanitized.endsWith('.json') ? sanitized : `${sanitized}.json`;
      
      if (isFilenameSavedInSession(filename)) {
        setSnackbar({ open: true, message: `Filename "${filename}" was also used in this session. Please choose a different name.`, severity: 'error' });
        return;
      }

      performSave(filename, pendingSave.themeDefinition);
      setShowRenameDialog(false);
      setPendingSave(null);
      setNewFilename('');
    }
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setNewFilename('');
  };

  const handleResetToDefaults = () => {
    setThemeDefinition(createDefaultThemeDefinition());
    setHasUnsavedChanges(true);
    setSnackbar({ open: true, message: 'Reset to default values!', severity: 'info' });
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

  const handleLoadTheme = async () => {
    try {
      const definition = await loadThemeFromFile();
      const validation = validateThemeDefinition(definition);
      
      if (!validation.isValid) {
        setSnackbar({ open: true, message: validation.error || 'Invalid theme file', severity: 'error' });
        return;
      }
      
      setThemeDefinition(definition);
      setHasUnsavedChanges(true);
      setSnackbar({ open: true, message: 'Theme loaded successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Error loading theme file', severity: 'error' });
    }
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
          <Button 
            color="inherit" 
            startIcon={livePreviewExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} 
            onClick={() => setLivePreviewExpanded(!livePreviewExpanded)}
          >
            {livePreviewExpanded ? 'Hide' : 'Show'} Preview
          </Button>
          <Button color="inherit" startIcon={<RestartAltIcon />} onClick={handleResetToDefaults}>
            Reset
          </Button>
          <Button color="inherit" startIcon={<UploadFileIcon />} onClick={handleLoadTheme}>
            Open
          </Button>
          <Button color="inherit" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Theme Name"
              value={themeDefinition.name}
              onChange={(e) => updateThemeDefinition({ name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              value={themeDefinition.version}
              onChange={(e) => updateThemeDefinition({ version: e.target.value })}
              placeholder="e.g., 1.0.0"
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          label="Theme Description"
          value={themeDefinition.description || ''}
          onChange={(e) => updateThemeDefinition({ description: e.target.value })}
          multiline
          rows={2}
          placeholder="Describe your theme..."
          sx={{ mt: 2, mb: 3 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={livePreviewExpanded ? 7 : 12}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
              <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable">
                <Tab label="Primary" />
                <Tab label="Secondary" />
                <Tab label="Status" />
                <Tab label="Background" />
                <Tab label="Components" />
                <Tab label="Full Theme JSON" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <ColorPicker
                      label="Primary Main"
                      value={themeDefinition.colors.primaryMain}
                      onChange={(v) => handleColorChange('colors.primaryMain', v)}
                    />
                    <ColorPicker
                      label="Primary Light"
                      value={themeDefinition.colors.primaryLight}
                      onChange={(v) => handleColorChange('colors.primaryLight', v)}
                    />
                    <ColorPicker
                      label="Primary Dark"
                      value={themeDefinition.colors.primaryDark}
                      onChange={(v) => handleColorChange('colors.primaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <ColorPicker
                      label="Secondary Main"
                      value={themeDefinition.colors.secondaryMain}
                      onChange={(v) => handleColorChange('colors.secondaryMain', v)}
                    />
                    <ColorPicker
                      label="Secondary Light"
                      value={themeDefinition.colors.secondaryLight}
                      onChange={(v) => handleColorChange('colors.secondaryLight', v)}
                    />
                    <ColorPicker
                      label="Secondary Dark"
                      value={themeDefinition.colors.secondaryDark}
                      onChange={(v) => handleColorChange('colors.secondaryDark', v)}
                    />
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <ColorPicker
                      label="Error Color"
                      value={themeDefinition.colors.errorMain}
                      onChange={(v) => handleColorChange('colors.errorMain', v)}
                    />
                    <ColorPicker
                      label="Warning Color"
                      value={themeDefinition.colors.warningMain}
                      onChange={(v) => handleColorChange('colors.warningMain', v)}
                    />
                    <ColorPicker
                      label="Info Color"
                      value={themeDefinition.colors.infoMain}
                      onChange={(v) => handleColorChange('colors.infoMain', v)}
                    />
                    <ColorPicker
                      label="Success Color"
                      value={themeDefinition.colors.successMain}
                      onChange={(v) => handleColorChange('colors.successMain', v)}
                    />
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Palette Mode</InputLabel>
                      <Select
                        value={themeDefinition.palette?.mode || 'light'}
                        label="Palette Mode"
                        onChange={(e) => updateThemeDefinition(prev => ({
                          ...prev,
                          palette: { ...prev.palette, mode: e.target.value as 'light' | 'dark' }
                        }))}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                      </Select>
                    </FormControl>
                    <ColorPicker
                      label="Background Color"
                      value={themeDefinition.colors.backgroundDefault}
                      onChange={(v) => handleColorChange('colors.backgroundDefault', v)}
                    />
                    <ColorPicker
                      label="Paper Color"
                      value={themeDefinition.colors.backgroundPaper}
                      onChange={(v) => handleColorChange('colors.backgroundPaper', v)}
                    />
                    <ColorPicker
                      label="Text Primary Color"
                      value={themeDefinition.colors.textPrimary}
                      onChange={(v) => handleColorChange('colors.textPrimary', v)}
                    />
                    <ColorPicker
                      label="Text Secondary Color"
                      value={themeDefinition.colors.textSecondary}
                      onChange={(v) => handleColorChange('colors.textSecondary', v)}
                    />
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Component Configuration
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Button Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Border Radius (px)"
                      value={themeDefinition.componentOverrides.button?.borderRadius || 4}
                      onChange={(e) => handleComponentOverrideChange('button', 'borderRadius', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Text Transform</InputLabel>
                      <Select
                        value={themeDefinition.componentOverrides.button?.textTransform || 'uppercase'}
                        label="Text Transform"
                        onChange={(e) => handleComponentOverrideChange('button', 'textTransform', e.target.value)}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="uppercase">Uppercase</MenuItem>
                        <MenuItem value="lowercase">Lowercase</MenuItem>
                        <MenuItem value="capitalize">Capitalize</MenuItem>
                      </Select>
                    </FormControl>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Paper & Card Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Paper Elevation"
                      value={themeDefinition.componentOverrides.paper?.elevation || 1}
                      onChange={(e) => handleComponentOverrideChange('paper', 'elevation', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Card Elevation"
                      value={themeDefinition.componentOverrides.card?.elevation || 1}
                      onChange={(e) => handleComponentOverrideChange('card', 'elevation', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Other Components
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="App Bar Elevation"
                      value={themeDefinition.componentOverrides.appBar?.elevation || 4}
                      onChange={(e) => handleComponentOverrideChange('appBar', 'elevation', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Drawer Width (px)"
                      value={themeDefinition.componentOverrides.drawer?.width || 240}
                      onChange={(e) => handleComponentOverrideChange('drawer', 'width', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Dialog Border Radius (px)"
                      value={themeDefinition.componentOverrides.dialog?.borderRadius || 8}
                      onChange={(e) => handleComponentOverrideChange('dialog', 'borderRadius', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Chip Border Radius (px)"
                      value={themeDefinition.componentOverrides.chip?.borderRadius || 16}
                      onChange={(e) => handleComponentOverrideChange('chip', 'borderRadius', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="List Padding (px)"
                      value={themeDefinition.componentOverrides.list?.padding || 8}
                      onChange={(e) => handleComponentOverrideChange('list', 'padding', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Tooltip Font Size (px)"
                      value={themeDefinition.componentOverrides.tooltip?.fontSize || 12}
                      onChange={(e) => handleComponentOverrideChange('tooltip', 'fontSize', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Typography Settings
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="H1 Font Size (px)"
                      value={themeDefinition.componentOverrides.typography?.h1FontSize || 96}
                      onChange={(e) => handleComponentOverrideChange('typography', 'h1FontSize', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="H2 Font Size (px)"
                      value={themeDefinition.componentOverrides.typography?.h2FontSize || 60}
                      onChange={(e) => handleComponentOverrideChange('typography', 'h2FontSize', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="H3 Font Size (px)"
                      value={themeDefinition.componentOverrides.typography?.h3FontSize || 48}
                      onChange={(e) => handleComponentOverrideChange('typography', 'h3FontSize', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Body Font Size (px)"
                      value={themeDefinition.componentOverrides.typography?.bodyFontSize || 16}
                      onChange={(e) => handleComponentOverrideChange('typography', 'bodyFontSize', parseInt(e.target.value, 10) || 0)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      For advanced MUI component overrides, use the Full Theme JSON tab.
                    </Typography>
                  </Box>
                )}

                {activeTab === 5 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Full Theme JSON Editor</Typography>
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
                        height="500px"
                        language="json"
                        value={JSON.stringify(themeDefinition, null, 2)}
                        onChange={handleFullThemeJsonChange}
                        theme={monacoSettings.theme}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          formatOnPaste: true,
                          formatOnType: true,
                        }}
                      />
                    </Box>

                    {themeJsonError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {themeJsonError}
                      </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      This editor shows the complete theme definition. 
                      All changes made here are immediately reflected in the other tabs and the live preview. 
                      Similarly, changes in other tabs update this JSON view.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {livePreviewExpanded && (
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', overflow: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Live Preview
                  </Typography>
                  <IconButton onClick={() => setLivePreviewExpanded(false)}>
                    <ExpandLessIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                <ThemeProvider theme={previewTheme}>
                  <Box sx={{ p: 1 }}>
                    <ComponentShowcase />
                  </Box>
                </ThemeProvider>
              </Paper>
            </Grid>
          )}
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

      {/* Overwrite File Dialog */}
      <ConfirmDialog open={showOverwriteDialog} onClose={() => setShowOverwriteDialog(false)}>
        <DialogTitle>File Already Exists</DialogTitle>
        <DialogContent>
          <Typography>
            A file named &quot;{pendingSave?.filename}&quot; was already saved during this session. 
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <strong>Note:</strong> Due to browser limitations, the &quot;Overwrite&quot; option will download the file again. 
            Your browser may automatically rename it (e.g., &quot;theme (1).json&quot;). 
            You&apos;ll need to manually replace the original file if needed.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Alternatively, you can save with a different filename to avoid conflicts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOverwriteDialog(false)}>Cancel</Button>
          <Button onClick={handleOverwriteRename} color="primary" variant="outlined">
            Save As Different Name
          </Button>
          <Button onClick={handleOverwriteConfirm} color="warning" variant="contained">
            Download Again
          </Button>
        </DialogActions>
      </ConfirmDialog>

      {/* Rename Theme Dialog */}
      <ConfirmDialog open={showRenameDialog} onClose={handleRenameCancel}>
        <DialogTitle>Save As Different Filename</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Enter a new filename for your theme:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Filename"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="my-custom-theme"
            helperText="The .json extension will be added automatically"
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameCancel}>Cancel</Button>
          <Button onClick={handleRenameConfirm} color="primary" variant="contained">
            Save
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

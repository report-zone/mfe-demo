import React from 'react';
import {
  Typography,
  Button,
  IconButton,
  TextField,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  Slider,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Box,
  Grid,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const ComponentShowcase: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  // Sample data for table
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User', status: 'Active' },
  ];

  const speedDialActions = [
    { icon: <FileCopyIcon />, name: 'Copy', action: () => console.log('Copy') },
    { icon: <PrintIcon />, name: 'Print', action: () => console.log('Print') },
    { icon: <ShareIcon />, name: 'Share', action: () => console.log('Share') },
    { icon: <EditIcon />, name: 'Edit', action: () => console.log('Edit') },
  ];

  return (
    <Stack spacing={3}>
          {/* Buttons */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Buttons
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
              <IconButton color="primary">
                <AddIcon />
              </IconButton>
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Box>

          <Divider />

          {/* Inputs */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Input Components
            </Typography>
            <Stack spacing={2}>
              <TextField label="Standard" variant="standard" />
              <TextField label="Outlined" variant="outlined" />
              <TextField label="Filled" variant="filled" />
              <Box>
                <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
                <FormControlLabel control={<Switch defaultChecked />} label="Switch" />
              </Box>
              <RadioGroup row>
                <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
              </RadioGroup>
              <Box sx={{ width: 300 }}>
                <Typography gutterBottom>Slider</Typography>
                <Slider defaultValue={30} />
              </Box>
              <Select value="option1" label="Select">
                <MenuItem value="option1">Option 1</MenuItem>
                <MenuItem value="option2">Option 2</MenuItem>
              </Select>
            </Stack>
          </Box>

          <Divider />

          {/* Cards and Papers */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Cards and Papers
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Card Title
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This is a card component with some content.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Paper Component</Typography>
                  <Typography variant="body2">This is a paper component.</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Chips */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Chips
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="Default" />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Success" color="success" />
              <Chip label="Error" color="error" />
              <Chip label="Warning" color="warning" />
              <Chip label="Info" color="info" />
            </Stack>
          </Box>

          <Divider />

          {/* Alerts */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Alerts
            </Typography>
            <Stack spacing={2}>
              <Alert severity="success">This is a success alert</Alert>
              <Alert severity="info">This is an info alert</Alert>
              <Alert severity="warning">This is a warning alert</Alert>
              <Alert severity="error">This is an error alert</Alert>
            </Stack>
          </Box>

          <Divider />

          {/* Lists */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Lists
            </Typography>
            <Paper>
              <List>
                <ListItem>
                  <ListItemText primary="List Item 1" secondary="Secondary text" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="List Item 2" secondary="Secondary text" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="List Item 3" secondary="Secondary text" />
                </ListItem>
              </List>
            </Paper>
          </Box>

          <Divider />

          {/* Typography */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Typography
            </Typography>
            <Stack spacing={1}>
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="h4">Heading 4</Typography>
              <Typography variant="h5">Heading 5</Typography>
              <Typography variant="h6">Heading 6</Typography>
              <Typography variant="body1">Body 1 text</Typography>
              <Typography variant="body2">Body 2 text</Typography>
              <Typography variant="caption">Caption text</Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Dialog */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Dialog
            </Typography>
            <Button variant="outlined" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogContent>
                <Typography>This is the dialog content.</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setDialogOpen(false)} variant="contained">
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Divider />

          {/* Tooltips */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tooltips
            </Typography>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Tooltip on top" placement="top">
                <Button variant="outlined">Top</Button>
              </Tooltip>
              <Tooltip title="Tooltip on right" placement="right">
                <Button variant="outlined">Right</Button>
              </Tooltip>
              <Tooltip title="Tooltip on bottom" placement="bottom">
                <Button variant="outlined">Bottom</Button>
              </Tooltip>
              <Tooltip title="Tooltip on left" placement="left">
                <Button variant="outlined">Left</Button>
              </Tooltip>
            </Stack>
          </Box>

          <Divider />

          {/* Accordion */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Accordion
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Getting Started</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Welcome to our application! This accordion section provides quick access to
                  essential information and guides to help you get started.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Account Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Manage your account preferences, security settings, and personal information
                  all in one place.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Privacy & Security</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Review and update your privacy settings, manage data sharing preferences,
                  and configure security options.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider />

          {/* Table */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Table
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={row.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* Tabs */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tabs
            </Typography>
            <Paper>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab label="Overview" />
                <Tab label="Analytics" />
                <Tab label="Reports" />
              </Tabs>
              <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <Typography>
                    Welcome to the Overview tab. Here you&apos;ll find a summary of your key metrics
                    and recent activity.
                  </Typography>
                )}
                {tabValue === 1 && (
                  <Typography>
                    The Analytics tab displays detailed insights and data visualizations to help
                    you make informed decisions.
                  </Typography>
                )}
                {tabValue === 2 && (
                  <Typography>
                    Access all your reports here. Generate, download, and share comprehensive
                    reports with your team.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* AppBar */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              AppBar
            </Typography>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6">AppBar Example</Typography>
              </Toolbar>
            </AppBar>
          </Box>

          <Divider />

          {/* Speed Dial */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Speed Dial
            </Typography>
            <Paper sx={{ position: 'relative', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Speed Dial appears in the bottom-right corner (hover to see actions)
              </Typography>
              <SpeedDial
                ariaLabel="Speed dial actions"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
              >
                {speedDialActions.map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                  />
                ))}
              </SpeedDial>
            </Paper>
          </Box>
        </Stack>
  );
};

export default ComponentShowcase;

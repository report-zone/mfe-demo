import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { login, signUp, confirmSignUp, resetPassword, confirmResetPassword } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
    setShowVerification(false);
    setShowResetConfirm(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await login(username, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signUp(username, password, email);
      setSuccess('Account created! Please check your email for verification code.');
      setShowVerification(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await confirmSignUp(username, verificationCode);
      setSuccess('Account verified! You can now sign in.');
      setShowVerification(false);
      setTabValue(0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await resetPassword(username);
      setSuccess('Password reset code sent to your email.');
      setShowResetConfirm(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Reset request failed';
      setError(errorMessage);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await confirmResetPassword(username, verificationCode, newPassword);
      setSuccess('Password reset successful! You can now sign in.');
      setShowResetConfirm(false);
      setTabValue(0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', m: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            MFE Demo
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
            <Tab label="Forgot Password" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {/* Sign In Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                Sign In
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setTabValue(2)}
                  type="button"
                >
                  Forgot password?
                </Link>
              </Box>
            </form>
          </TabPanel>

          {/* Sign Up Tab */}
          <TabPanel value={tabValue} index={1}>
            {!showVerification ? (
              <form onSubmit={handleSignUp}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Create Account
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmSignUp}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  variant="outlined"
                  margin="normal"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                  helperText="Enter the code sent to your email"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Verify Account
                </Button>
              </form>
            )}
          </TabPanel>

          {/* Forgot Password Tab */}
          <TabPanel value={tabValue} index={2}>
            {!showResetConfirm ? (
              <form onSubmit={handleForgotPassword}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  helperText="Enter your username to receive a reset code"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Send Reset Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  variant="outlined"
                  margin="normal"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                  helperText="Enter the code sent to your email"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Reset Password
                </Button>
              </form>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

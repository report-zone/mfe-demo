import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Container,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Enter Username', 'Verify Code', 'Reset Password'];

const ResetPasswordPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword, confirmResetPassword } = useAuth();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await resetPassword(username);
      setSuccess('Reset code sent to your email!');
      setActiveStep(1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Reset request failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setActiveStep(2);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await confirmResetPassword(username, verificationCode, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <LockReset sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                  Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recover your account access
                </Typography>
              </Box>

              <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {activeStep === 0 && (
                <Box component="form" onSubmit={handleRequestReset} noValidate>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter your username to receive a password reset code via email.
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Remember your password?{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
                        sx={{ textDecoration: 'none', fontWeight: 600 }}
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box component="form" onSubmit={handleVerifyCode} noValidate>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    We&apos;ve sent a verification code to the email associated with your account. Please
                    enter it below.
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="verificationCode"
                    label="Verification Code"
                    name="verificationCode"
                    autoFocus
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    helperText="Check your email for the 6-digit code"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    Verify Code
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Didn&apos;t receive the code?{' '}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => setActiveStep(0)}
                        sx={{ textDecoration: 'none', fontWeight: 600 }}
                      >
                        Resend
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                <Box component="form" onSubmit={handleConfirmReset} noValidate>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter your new password below.
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    autoComplete="new-password"
                    autoFocus
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    helperText="Must be at least 8 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;

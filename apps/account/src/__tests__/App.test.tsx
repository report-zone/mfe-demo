import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';

const renderApp = () => {
  return render(
    <I18nProvider config={i18nConfig}>
      <App />
    </I18nProvider>
  );
};

describe('Account MFE - App Component', () => {
  it('should render account title', () => {
    renderApp();
    expect(screen.getByText('Account')).toBeDefined();
  });

  it('should render description', () => {
    renderApp();
    expect(screen.getByText(/Manage your account information/i)).toBeDefined();
  });

  it('should render account icon', () => {
    const { container } = renderApp();
    const icon = container.querySelector('svg[data-testid="AccountCircleIcon"]');
    expect(icon).toBeDefined();
  });

  it('should render first name field', () => {
    renderApp();
    expect(screen.getByLabelText('First Name')).toBeDefined();
  });

  it('should render last name field', () => {
    renderApp();
    expect(screen.getByLabelText('Last Name')).toBeDefined();
  });

  it('should render email field', () => {
    renderApp();
    expect(screen.getByLabelText('Email')).toBeDefined();
  });

  it('should render phone number field', () => {
    renderApp();
    expect(screen.getByLabelText('Phone Number')).toBeDefined();
  });

  it('should render bio field', () => {
    renderApp();
    expect(screen.getByLabelText('Bio')).toBeDefined();
  });

  it('should render save changes button', () => {
    renderApp();
    expect(screen.getByText('Save Changes')).toBeDefined();
  });

  it('should have default values in form fields', () => {
    renderApp();
    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    expect(firstNameInput.value).toBe('John');
    
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('john.doe@example.com');
  });
});

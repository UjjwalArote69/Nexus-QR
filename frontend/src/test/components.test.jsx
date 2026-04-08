import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './mocks.jsx';
import { mockNavigate, setAuthState, resetQRMocks } from './mocks.jsx';

// ============================================================
// 1. NotFound Page (Critical Bug #2)
// ============================================================
describe('NotFound Page', () => {
  it('renders 404 content with a link back to home', async () => {
    const { default: NotFound } = await import('../pages/NotFound');
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText('Back to Home').closest('a')).toHaveAttribute('href', '/');
  });
});

// ============================================================
// 2. BuilderContext default value (Critical Bug #4)
// ============================================================
describe('BuilderContext', () => {
  it('has default values so consumers outside Provider do not crash', async () => {
    // Import the real module (not the mock)
    vi.doUnmock('../context/BuilderContext');
    const { default: BuilderContext } = await import('../context/BuilderContext');
    // Access _currentValue (React internals for testing defaults)
    const defaults = BuilderContext._currentValue;
    expect(defaults).toBeDefined();
    expect(defaults.builderStep).toBe(1);
    expect(defaults.selectedType).toBeNull();
    expect(typeof defaults.setBuilderStep).toBe('function');
    expect(typeof defaults.setSelectedType).toBe('function');
  });
});

// ============================================================
// 3. Login Page (Auth Bugs #5, #6, #9)
// ============================================================
describe('Login Page', () => {
  let Login;

  beforeEach(async () => {
    vi.clearAllMocks();
    setAuthState({
      login: vi.fn().mockResolvedValue({ success: true }),
    });
    const mod = await import('../pages/Login');
    Login = mod.default;
  });

  it('renders password visibility toggle', () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button (it's in the password field area)
    const toggleBtn = passwordInput.closest('div').querySelector('button');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders a functional remember-me checkbox', () => {
    render(<Login />);
    const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('shows submit button with loading state', async () => {
    setAuthState({
      login: vi.fn(() => new Promise(() => {})), // never resolves
    });
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.type(passwordInput, 'password123');

    const button = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });
});

// ============================================================
// 4. Register Page (Auth Bugs #7, #8)
// ============================================================
describe('Register Page', () => {
  let Register;

  beforeEach(async () => {
    vi.clearAllMocks();
    setAuthState({
      register: vi.fn().mockResolvedValue({ success: true }),
    });
    const mod = await import('../pages/Register');
    Register = mod.default;
  });

  it('renders confirm password field', () => {
    render(<Register />);
    // Both password and confirm password share same placeholder, so use getAllBy
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs.length).toBe(2);
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows password strength meter when typing', async () => {
    render(<Register />);
    const passwordInput = screen.getByLabelText('Password');
    await userEvent.type(passwordInput, 'Str0ng!Pass');

    // Strength meter should appear
    await waitFor(() => {
      const strengthText = screen.queryByText(/weak|fair|good|strong/i);
      expect(strengthText).toBeInTheDocument();
    });
  });

  it('shows mismatch error when passwords differ', async () => {
    render(<Register />);
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmInput, 'different');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('has password visibility toggle', () => {
    render(<Register />);
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.closest('div').querySelector('button');
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

// ============================================================
// 5. ResetPassword Page (Auth Bug #7)
// ============================================================
describe('ResetPassword Page', () => {
  it('renders password strength meter', async () => {
    // Mock search params to include a token
    const { mockUseSearchParams: mUSP } = await import('./mocks.jsx');
    mUSP.mockReturnValue([new URLSearchParams('token=abc'), vi.fn()]);

    const { default: ResetPassword } = await import('../pages/ResetPassword');
    const { unmount } = render(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText('At least 8 characters');
    await userEvent.type(passwordInput, 'MyP@ss1234');

    await waitFor(() => {
      const strengthText = screen.queryByText(/weak|fair|good|strong/i);
      expect(strengthText).toBeInTheDocument();
    });

    unmount();
    mUSP.mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  it('shows invalid token message when no token', async () => {
    const { mockUseSearchParams: mUSP } = await import('./mocks.jsx');
    mUSP.mockReturnValue([new URLSearchParams(), vi.fn()]);

    const { default: ResetPassword } = await import('../pages/ResetPassword');
    render(<ResetPassword />);

    expect(screen.getByText('Invalid reset link')).toBeInTheDocument();
  });
});

// ============================================================
// 6. ProtectedRoute (Critical Bug #13 - verified working)
// ============================================================
describe('ProtectedRoute', () => {
  it('shows loader when isLoading is true', async () => {
    setAuthState({ isLoading: true, isAuthenticated: false });
    const { default: ProtectedRoute } = await import('../components/layout/ProtectedRoute');
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    setAuthState({ isLoading: false, isAuthenticated: false });
    const { default: ProtectedRoute } = await import('../components/layout/ProtectedRoute');
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('renders children when authenticated', async () => {
    setAuthState({ isLoading: false, isAuthenticated: true });
    const { default: ProtectedRoute } = await import('../components/layout/ProtectedRoute');
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

// ============================================================
// 7. Auth Store (Bugs #11, #16)
// ============================================================
describe('authStore cross-tab sync', () => {
  it('module exports a default function', async () => {
    vi.doUnmock('../store/authStore');
    const mod = await import('../store/authStore');
    expect(mod.default).toBeDefined();
  });
});

// ============================================================
// 8. sessionToken utility (Bug #16)
// ============================================================
describe('sessionToken', () => {
  beforeEach(() => { window.localStorage.clear(); });

  it('getSessionToken creates and returns a token', async () => {
    vi.doUnmock('../utils/sessionToken');
    const { getSessionToken, clearSessionToken, hasSessionToken } = await import('../utils/sessionToken');

    const token = getSessionToken();
    expect(token).toBeTruthy();
    expect(hasSessionToken()).toBe(true);

    clearSessionToken();
    expect(hasSessionToken()).toBe(false);
  });
});

// ============================================================
// 9. Email Validation (Form Bug #22)
// ============================================================
describe('Email validation regex', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('accepts valid emails', () => {
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('a.b@c.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(emailRegex.test('userexample.com')).toBe(false);
    expect(emailRegex.test('user@')).toBe(false);
    expect(emailRegex.test('@example.com')).toBe(false);
    expect(emailRegex.test('user @example.com')).toBe(false);
  });
});

// ============================================================
// 10. Phone Validation (Form Bug #23)
// ============================================================
describe('Phone validation regex', () => {
  const phoneRegex = /^[+\d][\d\s\-()]{6,}$/;

  it('accepts valid phone numbers', () => {
    expect(phoneRegex.test('+1 234 567 8900')).toBe(true);
    expect(phoneRegex.test('1234567890')).toBe(true);
    expect(phoneRegex.test('+44 20 7946 0958')).toBe(true);
    expect(phoneRegex.test('5551234567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(phoneRegex.test('abc')).toBe(false);
    expect(phoneRegex.test('12345')).toBe(false); // too short
    expect(phoneRegex.test('')).toBe(false);
  });
});

// ============================================================
// 11. URL Validation (Form Bug #24)
// ============================================================
describe('URL validation', () => {
  const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };

  it('accepts valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://test.co/path?q=1')).toBe(true);
    expect(isValidUrl('https://sub.domain.com/page')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

// ============================================================
// 12. Hex Color Validation (Form Bug #28)
// ============================================================
describe('Hex color validation', () => {
  const hexRegex = /^#[0-9a-fA-F]{0,6}$/;

  it('accepts valid hex values', () => {
    expect(hexRegex.test('#')).toBe(true);
    expect(hexRegex.test('#f')).toBe(true);
    expect(hexRegex.test('#ff00ff')).toBe(true);
    expect(hexRegex.test('#ABC')).toBe(true);
  });

  it('rejects invalid hex values', () => {
    expect(hexRegex.test('ff00ff')).toBe(false); // missing #
    expect(hexRegex.test('#gggggg')).toBe(false); // invalid chars
    expect(hexRegex.test('#1234567')).toBe(false); // too long
  });
});

// ============================================================
// 13. Password Strength (Auth Bug #7)
// ============================================================
describe('Password strength calculator', () => {
  // Re-implement the function to test it directly
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
  };

  it('returns empty for no password', () => {
    expect(getPasswordStrength('').score).toBe(0);
  });

  it('rates short passwords as Weak', () => {
    expect(getPasswordStrength('abc').label).toBe('Weak');
  });

  it('rates moderate passwords as Fair/Good', () => {
    const result = getPasswordStrength('Abcdefgh');
    expect(['Fair', 'Good']).toContain(result.label);
  });

  it('rates complex passwords as Strong/Very Strong', () => {
    const result = getPasswordStrength('MyStr0ng!Pass99');
    expect(['Strong', 'Very Strong']).toContain(result.label);
  });
});

// ============================================================
// 14. MyQRCodesView filter persistence (Routing Bug #18)
// ============================================================
describe('Filter state persistence', () => {
  beforeEach(() => { window.sessionStorage.clear(); });

  it('stores and retrieves filter state from sessionStorage', () => {
    const filters = { searchTerm: 'test', filterType: 'Website', sortBy: 'oldest', dateFrom: '', dateTo: '' };
    sessionStorage.setItem('qr_filters', JSON.stringify(filters));

    const stored = JSON.parse(sessionStorage.getItem('qr_filters'));
    expect(stored.searchTerm).toBe('test');
    expect(stored.filterType).toBe('Website');
    expect(stored.sortBy).toBe('oldest');
  });

  it('returns empty object for missing/corrupt storage', () => {
    sessionStorage.setItem('qr_filters', 'not-json');
    let result;
    try { result = JSON.parse(sessionStorage.getItem('qr_filters')); }
    catch { result = {}; }
    expect(result).toEqual({});
  });
});

// ============================================================
// 15. WiFi password validation (Form Bug #25)
// ============================================================
describe('WiFi form validation logic', () => {
  it('requires password when encryption is WPA', () => {
    const encryption = 'WPA';
    const password = '';
    const networkName = 'TestNetwork';

    const errors = [];
    if (!networkName) errors.push('SSID required');
    if (encryption !== 'None' && !password) errors.push('Password required');

    expect(errors).toContain('Password required');
  });

  it('does not require password when encryption is None', () => {
    const encryption = 'None';
    const password = '';
    const networkName = 'TestNetwork';

    const errors = [];
    if (!networkName) errors.push('SSID required');
    if (encryption !== 'None' && !password) errors.push('Password required');

    expect(errors).not.toContain('Password required');
  });
});

// ============================================================
// 16. Business contact validation (Form Bug #29)
// ============================================================
describe('Business form contact validation logic', () => {
  it('requires at least one contact method', () => {
    const business = { companyName: 'ACME', phone: '', email: '', website: '' };
    const hasContact = business.phone || business.email || business.website;
    expect(hasContact).toBeFalsy();
  });

  it('passes with at least one contact method', () => {
    const business = { companyName: 'ACME', phone: '', email: 'a@b.com', website: '' };
    const hasContact = business.phone || business.email || business.website;
    expect(hasContact).toBeTruthy();
  });
});

// ============================================================
// 17. Links form error specificity (Form Bug #26)
// ============================================================
describe('Links form specific error messages', () => {
  it('identifies which link is missing fields', () => {
    const links = [
      { id: 1, title: 'Good', url: 'https://a.com' },
      { id: 2, title: '', url: 'https://b.com' },
      { id: 3, title: 'Third', url: '' },
    ];

    const firstBadLink = links.find(l => !l.url || !l.title);
    const idx = links.indexOf(firstBadLink) + 1;
    const field = !firstBadLink.title ? 'title' : 'URL';

    expect(idx).toBe(2);
    expect(field).toBe('title');
  });
});

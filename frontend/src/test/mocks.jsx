import { vi } from 'vitest';

// --- Mock react-router-dom ---
export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn(() => ({ state: null, pathname: '/' }));
export const mockUseSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
    useSearchParams: () => mockUseSearchParams(),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
    BrowserRouter: ({ children }) => <div>{children}</div>,
  };
});

// --- Mock framer-motion ---
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// --- Mock stores ---
const mockAuthState = {
  user: { id: '1', name: 'Test User', email: 'test@example.com', createdAt: '2025-01-01' },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn(),
  checkAuth: vi.fn(),
};

export const getAuthState = () => ({ ...mockAuthState });
export const setAuthState = (overrides) => Object.assign(mockAuthState, overrides);

vi.mock('../store/authStore', () => ({
  __esModule: true,
  default: (selector) => {
    if (typeof selector === 'function') return selector(mockAuthState);
    return mockAuthState;
  },
}));

const mockQRState = {
  title: '',
  fgColor: '#000000',
  bgColor: '#ffffff',
  dotStyle: 'square',
  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',
  logoFile: null,
  logoDataUrl: null,
  isLoading: false,
  error: null,
  showAuthPrompt: false,
  setTitle: vi.fn(),
  setFgColor: vi.fn(),
  setBgColor: vi.fn(),
  setError: vi.fn((msg) => { mockQRState.error = msg; }),
  resetStore: vi.fn(),
  createQRCode: vi.fn().mockResolvedValue({ success: true, qrLink: 'https://test.link/qr123' }),
  createQRWithFileAction: vi.fn().mockResolvedValue({ success: true, qrLink: 'https://test.link/qr456' }),
};

export const getQRState = () => ({ ...mockQRState });
export const resetQRMocks = () => {
  mockQRState.error = null;
  mockQRState.isLoading = false;
  Object.values(mockQRState).forEach(v => { if (typeof v?.mockClear === 'function') v.mockClear(); });
};

vi.mock('../store/qrStore', () => ({
  __esModule: true,
  default: (selector) => {
    if (typeof selector === 'function') return selector(mockQRState);
    return mockQRState;
  },
}));

// --- Mock hooks ---
vi.mock('../hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock('../hooks/usePageTitle', () => ({
  __esModule: true,
  default: () => {},
}));

vi.mock('../hooks/useScanNotifications', () => ({
  __esModule: true,
  default: () => ({ current: null }),
}));

// --- Mock context ---
vi.mock('../context/BuilderContext', () => ({
  __esModule: true,
  default: {
    Provider: ({ children, value }) => <div data-testid="builder-context">{children}</div>,
    Consumer: ({ children }) => children({ builderStep: 2, setBuilderStep: vi.fn(), selectedType: 'test', setSelectedType: vi.fn() }),
  },
}));

// --- Mock API ---
vi.mock('../api/auth.api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock('../api/qrcode.api', () => ({
  fetchMyQRCodes: vi.fn().mockResolvedValue({ success: true, data: [] }),
  deleteQRCode: vi.fn(),
  duplicateQRCode: vi.fn(),
  toggleFavorite: vi.fn(),
  batchDeleteQRCodes: vi.fn(),
  updateQRCode: vi.fn(),
  generateQRCode: vi.fn(),
  createQRWithFile: vi.fn(),
}));

vi.mock('../api/folder.api', () => ({
  fetchFolders: vi.fn().mockResolvedValue({ success: true, data: [] }),
  createFolder: vi.fn(),
  deleteFolder: vi.fn(),
}));

vi.mock('../api/analytics.api', () => ({
  fetchOverview: vi.fn().mockResolvedValue({ data: {} }),
  fetchRecentScans: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('../api/template.api', () => ({
  fetchTemplates: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

// --- Mock socket.io ---
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  })),
}));

// --- Mock components used by forms ---
vi.mock('../components/UTMBuilder', () => ({
  __esModule: true,
  default: () => <div data-testid="utm-builder" />,
}));

vi.mock('../pages/Dashboard/components/TemplatePicker', () => ({
  __esModule: true,
  default: () => <div data-testid="template-picker" />,
}));

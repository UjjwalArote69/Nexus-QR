# NexusQR Frontend

React single-page application for the NexusQR platform. Built with React 19, Vite 7, Tailwind CSS 4, and Zustand for state management.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + Framer Motion
- **State:** Zustand
- **Routing:** React Router 7
- **HTTP:** Axios
- **Real-time:** Socket.io-client
- **Charts:** Chart.js + react-chartjs-2
- **Maps:** Leaflet + react-leaflet
- **QR Rendering:** qr-code-styling, qrcode.react
- **PDF Export:** jsPDF
- **ZIP Export:** JSZip
- **Icons:** Lucide React
- **Toasts:** React Hot Toast

---

## Directory Structure

```
frontend/src/
├── api/                          # API client modules
│   ├── axios.js                  # Axios instance with auth interceptor
│   ├── auth.api.js               # Register, login, profile, password, delete
│   ├── qrcode.api.js             # QR CRUD, duplicate, favorite, batch ops
│   ├── analytics.api.js          # Overview, timeseries, devices, geo, heatmap
│   ├── template.api.js           # Template CRUD
│   └── folder.api.js             # Folder CRUD
│
├── store/                        # Zustand state stores
│   ├── authStore.js              # User auth state + login/register/logout
│   └── qrStore.js                # QR creation state (title, colors)
│
├── hooks/                        # Custom React hooks
│   ├── useTheme.jsx              # Dark/light mode toggle with localStorage
│   └── useScanNotifications.jsx  # Socket.io real-time scan toast alerts
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx           # Dashboard navigation sidebar
│   │   ├── Topbar.jsx            # Top bar with theme toggle + user menu
│   │   ├── Loader.jsx            # Full-page loading spinner
│   │   └── ProtectedRoute.jsx    # Auth guard for dashboard routes
│   ├── ui/
│   │   ├── AnimatedPage.jsx      # Framer Motion page transitions
│   │   ├── ConfirmModal.jsx      # Reusable confirmation dialog
│   │   ├── StaggeredGrid.jsx     # Animated grid layout
│   │   └── Skeleton.jsx          # Loading skeleton placeholders
│   ├── UTMBuilder.jsx            # UTM parameter builder for campaigns
│   ├── ScanHeatmap.jsx           # Leaflet map with scan markers
│   └── Pricing.jsx               # Pricing plan display
│
├── pages/
│   ├── LandingPage.jsx           # Public homepage
│   ├── Login.jsx                 # Login form
│   ├── Register.jsx              # Registration form
│   │
│   ├── Dashboard/
│   │   ├── Dashboard.jsx         # Main layout (sidebar + content switcher)
│   │   ├── views/
│   │   │   ├── HomeView.jsx          # Dashboard home with stats overview
│   │   │   ├── CreateQRView.jsx      # QR creation with type selector
│   │   │   ├── MyQRCodesView.jsx     # QR library with folders, filters, bulk ops
│   │   │   ├── StatisticsView.jsx    # Global analytics dashboard
│   │   │   ├── QRAnalyticsView.jsx   # Per-QR analytics (charts, export)
│   │   │   ├── TemplatesView.jsx     # QR style template management
│   │   │   ├── SettingsView.jsx      # App settings (theme, notifications, export)
│   │   │   ├── UserProfileView.jsx   # Profile & password management
│   │   │   ├── PlansView.jsx         # Subscription plans
│   │   │   ├── ContactView.jsx       # Contact/support page
│   │   │   └── HelpCenterView.jsx    # Help documentation
│   │   └── components/
│   │       ├── QRGridSection.jsx     # QR code card grid
│   │       ├── TemplatePicker.jsx    # Template selection UI
│   │       ├── Static/              # Static QR form components
│   │       │   ├── TextQRForm.jsx
│   │       │   ├── EmailQRForm.jsx
│   │       │   ├── SmsQRForm.jsx
│   │       │   └── WifiQRForm.jsx
│   │       └── Dynamic/             # Dynamic QR form components
│   │           ├── WebsiteQRForm.jsx
│   │           ├── PdfQRForm.jsx
│   │           ├── ImageQRForm.jsx
│   │           ├── VideoQRForm.jsx
│   │           ├── Mp3QRForm.jsx
│   │           ├── LinksQRForm.jsx
│   │           ├── SocialQRForm.jsx
│   │           ├── AppStoreQRForm.jsx
│   │           ├── VCardQRForm.jsx
│   │           ├── BusinessQRForm.jsx
│   │           ├── CouponQRForm.jsx
│   │           └── LandingPageQRForm.jsx
│   │
│   └── Public/                   # Public-facing QR profile pages
│       ├── VCardProfile.jsx
│       ├── LinksProfile.jsx
│       ├── SocialProfile.jsx
│       ├── BusinessProfile.jsx
│       ├── CouponProfile.jsx
│       ├── AppStoreProfile.jsx
│       └── LandingProfile.jsx
│
├── App.jsx                       # React Router configuration
├── main.jsx                      # React DOM entry point
└── index.css                     # Tailwind CSS imports
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

### 3. Start the dev server

```bash
npm run dev
```

App opens at `http://localhost:5173`.

---

## Scripts

| Script            | Command        | Description              |
| ----------------- | -------------- | ------------------------ |
| `npm run dev`     | `vite`         | Start dev server (HMR)   |
| `npm run build`   | `vite build`   | Production build         |
| `npm run preview` | `vite preview`  | Preview production build |
| `npm run lint`    | `eslint .`     | Run ESLint               |

---

## Routing

### Public Routes

| Path           | Component       | Description             |
| -------------- | --------------- | ----------------------- |
| `/`            | LandingPage     | Homepage                |
| `/login`       | Login           | Login form              |
| `/register`    | Register        | Registration form       |
| `/:shortId`    | Public profiles | vCard, Links, Social, Business, Coupon, AppStore, Landing |

### Protected Routes (require authentication)

| Path        | Component       | Description                        |
| ----------- | --------------- | ---------------------------------- |
| `/dashboard`| Dashboard       | Main app shell with sidebar        |

Dashboard uses an internal navigation system (not URL routing) with these views:

| Nav Item     | View Component    | Description                           |
| ------------ | ----------------- | ------------------------------------- |
| Home         | HomeView          | Dashboard overview with stats         |
| Create QR    | CreateQRView      | QR code creation with 16 type forms   |
| My QR Codes  | MyQRCodesView     | QR library, folders, filters, bulk ops|
| Statistics   | StatisticsView    | Global analytics charts               |
| Templates    | TemplatesView     | QR style template manager             |
| Settings     | SettingsView      | Theme, notifications, export, account |
| Profile      | UserProfileView   | Name, email, password management      |
| Plans        | PlansView         | Subscription plans                    |
| Contact      | ContactView       | Support contact                       |
| Help Center  | HelpCenterView    | Help documentation                    |

---

## State Management

### authStore (Zustand)

| State           | Type    | Description                  |
| --------------- | ------- | ---------------------------- |
| `user`          | Object  | Current user data            |
| `token`         | String  | JWT token                    |
| `isAuthenticated` | Boolean | Auth status               |
| `isLoading`     | Boolean | Loading state                |

| Action          | Description                          |
| --------------- | ------------------------------------ |
| `login()`       | Authenticate and store token         |
| `register()`    | Create account and store token       |
| `checkAuth()`   | Verify token on app load             |
| `logout()`      | Clear token and redirect             |

### qrStore (Zustand)

| State       | Default   | Description              |
| ----------- | --------- | ------------------------ |
| `title`     | `''`      | QR code title            |
| `fgColor`   | `#000000` | Foreground color         |
| `bgColor`   | `#ffffff` | Background color         |

| Action           | Description                     |
| ---------------- | ------------------------------- |
| `createQRCode()` | Call API to generate QR code    |
| `resetStore()`   | Clear all creation state        |

---

## API Client

All API calls go through `api/axios.js` which:
- Sets base URL from `VITE_BACKEND_URL` environment variable
- Enables `withCredentials: true` for cookie support
- Automatically attaches `Authorization: Bearer <token>` header from localStorage

### Available API modules

| Module           | Functions                                                    |
| ---------------- | ------------------------------------------------------------ |
| `auth.api`       | registerUser, loginUser, fetchProfile, updateProfile, changePassword, deleteAccount |
| `qrcode.api`     | generateQRCode, createQRWithFile, fetchMyQRCodes, updateQRCode, deleteQRCode, duplicateQRCode, toggleFavorite, batchDeleteQRCodes, fetchRecentScans |
| `analytics.api`  | fetchOverview, fetchTimeseries, fetchDevices, fetchGeo, fetchTopCampaigns, fetchQRAnalytics, fetchHeatmapData |
| `template.api`   | fetchTemplates, createTemplate, updateTemplate, deleteTemplate, applyTemplate |
| `folder.api`     | fetchFolders, createFolder, updateFolder, deleteFolder       |

---

## Custom Hooks

### `useTheme()`

Manages dark/light mode. Reads preference from `localStorage('theme')`, falls back to system `prefers-color-scheme`. Toggles the `dark` class on `<html>`.

```jsx
const { isDark, toggleTheme } = useTheme();
```

### `useScanNotifications(userId)`

Connects to the Socket.io server and listens for real-time scan events. Shows a toast notification with QR title, scan location, device, and browser info.

```jsx
useScanNotifications(user?.id);
```

---

## QR Code Types

### Static (data encoded in QR image)
| Type  | Form Component   | Description          |
| ----- | ---------------- | -------------------- |
| Text  | TextQRForm       | Plain text           |
| Email | EmailQRForm      | mailto: link         |
| SMS   | SmsQRForm        | sms: link            |
| WiFi  | WifiQRForm       | WiFi auto-connect    |

### Dynamic (trackable short URL)
| Type         | Form Component       | Description                |
| ------------ | -------------------- | -------------------------- |
| Website      | WebsiteQRForm        | URL redirect + UTM builder |
| PDF          | PdfQRForm            | Hosted PDF file            |
| Image        | ImageQRForm          | Hosted image               |
| Video        | VideoQRForm          | Hosted video               |
| MP3          | Mp3QRForm            | Hosted audio               |
| Links        | LinksQRForm          | Multi-link collection      |
| Social       | SocialQRForm         | Social media links         |
| App Store    | AppStoreQRForm       | App download links         |
| vCard        | VCardQRForm          | Digital contact card       |
| Business     | BusinessQRForm       | Business card              |
| Coupon       | CouponQRForm         | Promotional coupon         |
| Landing Page | LandingPageQRForm    | Custom landing page        |

---

## Environment Variables

| Variable           | Required | Default                  | Description          |
| ------------------ | -------- | ------------------------ | -------------------- |
| `VITE_BACKEND_URL` | No       | http://localhost:5000/api | Backend API base URL |

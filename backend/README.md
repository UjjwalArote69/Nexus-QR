# NexusQR Backend

REST API server for the NexusQR platform. Built with Express 5, Sequelize ORM, and Socket.io for real-time scan notifications.

---

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **ORM:** Sequelize 6 (MySQL)
- **Auth:** JWT + bcryptjs
- **Real-time:** Socket.io
- **File Upload:** Multer + Cloudinary
- **Validation:** Zod
- **Logging:** Winston (daily rotating files) + Morgan (HTTP)
- **Security:** Helmet, CORS, cookie-parser

---

## Directory Structure

```
backend/
├── config/
│   ├── db.js              # Sequelize MySQL connection
│   ├── logger.js          # Winston logger with daily rotation
│   └── cloudinary.js      # Cloudinary file upload config
│
├── controllers/
│   ├── user.controller.js       # Auth: register, login, profile, password, delete
│   ├── qrcode.controller.js     # QR CRUD, scan redirect, file upload, batch ops
│   ├── analytics.controller.js  # Overview, timeseries, devices, geo, heatmap
│   ├── template.controller.js   # QR style template CRUD
│   └── folder.controller.js     # Folder CRUD with QR count aggregation
│
├── middleware/
│   ├── auth.middleware.js            # JWT token verification (protect)
│   ├── validator.middleware.js       # Zod schema validation (register/login)
│   ├── requestLogger.middleware.js   # Morgan HTTP request logging
│   └── errorHandler.middleware.js    # Centralized error handler
│
├── models/
│   ├── user.model.js       # User (UUID, name, email, bcrypt password)
│   ├── qrcode.model.js     # QRCode (16 types, shortId, scan tracking)
│   ├── scanEvent.model.js  # ScanEvent (geo, device, browser, referrer)
│   ├── template.model.js   # Template (foreground/background colors)
│   └── folder.model.js     # Folder (name, color, user ownership)
│
├── routes/
│   ├── user.route.js       # /api/users/*
│   ├── qrcode.route.js     # /api/qrcodes/*
│   ├── analytics.route.js  # /api/analytics/*
│   ├── template.route.js   # /api/templates/*
│   └── folder.route.js     # /api/folders/*
│
├── logs/                   # Auto-generated daily log files
├── server.js               # Entry point
├── package.json
└── .env
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_NAME=qr_code
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Start MySQL

Ensure MySQL is running on the configured host and port. The database and tables are created automatically via `sequelize.sync({ alter: true })`.

### 4. Run the server

```bash
# Development (hot-reload via nodemon)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

---

## API Reference

### Authentication

| Method | Endpoint               | Auth | Body                              | Description        |
| ------ | ---------------------- | ---- | --------------------------------- | ------------------ |
| POST   | `/api/users/register`  | No   | `{ name, email, password }`       | Register user      |
| POST   | `/api/users/login`     | No   | `{ email, password }`             | Login, returns JWT |
| POST   | `/api/users/logout`    | No   | —                                 | Clear auth cookie  |
| GET    | `/api/users/profile`   | Yes  | —                                 | Get current user   |
| PUT    | `/api/users/profile`   | Yes  | `{ name?, email? }`              | Update profile     |
| PUT    | `/api/users/password`  | Yes  | `{ currentPassword, newPassword }`| Change password    |
| DELETE | `/api/users/account`   | Yes  | `{ password }`                    | Delete account     |

### QR Codes

| Method | Endpoint                        | Auth | Description                    |
| ------ | ------------------------------- | ---- | ------------------------------ |
| POST   | `/api/qrcodes/create`           | Yes  | Create QR code (JSON body)     |
| POST   | `/api/qrcodes/create-with-file` | Yes  | Create QR with file (multipart)|
| GET    | `/api/qrcodes/my-qrs`           | Yes  | List all user's QR codes       |
| GET    | `/api/qrcodes/recent-scans`     | Yes  | Recent scan activity           |
| GET    | `/api/qrcodes/public/:shortId`  | No   | Get public QR data             |
| PUT    | `/api/qrcodes/:id`              | Yes  | Update QR code                 |
| DELETE | `/api/qrcodes/:id`              | Yes  | Delete QR code                 |
| POST   | `/api/qrcodes/:id/duplicate`    | Yes  | Duplicate QR code              |
| PATCH  | `/api/qrcodes/:id/favorite`     | Yes  | Toggle favorite status         |
| POST   | `/api/qrcodes/batch-delete`     | Yes  | Delete multiple `{ ids: [] }`  |

### Public Scan Route

| Method | Endpoint        | Description                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/q/:shortId`   | Redirect to target URL, log scan event |

### Analytics

All analytics endpoints accept `?period=24h|7d|30d|90d` query parameter.

| Method | Endpoint                    | Auth | Description                   |
| ------ | --------------------------- | ---- | ----------------------------- |
| GET    | `/api/analytics/overview`   | Yes  | KPI summary (totals, growth)  |
| GET    | `/api/analytics/timeseries` | Yes  | Scan counts over time         |
| GET    | `/api/analytics/devices`    | Yes  | OS, browser, device breakdown |
| GET    | `/api/analytics/geo`        | Yes  | Country and city breakdown    |
| GET    | `/api/analytics/campaigns`  | Yes  | Top performing QR codes       |
| GET    | `/api/analytics/heatmap`    | Yes  | Lat/lng scan coordinates      |
| GET    | `/api/analytics/qr/:id`     | Yes  | Full analytics for one QR     |

### Templates

| Method | Endpoint              | Auth | Description         |
| ------ | --------------------- | ---- | ------------------- |
| GET    | `/api/templates/`     | Yes  | List templates      |
| POST   | `/api/templates/`     | Yes  | Create template     |
| PUT    | `/api/templates/:id`  | Yes  | Update template     |
| DELETE | `/api/templates/:id`  | Yes  | Delete template     |

### Folders

| Method | Endpoint             | Auth | Description                     |
| ------ | -------------------- | ---- | ------------------------------- |
| GET    | `/api/folders/`      | Yes  | List folders (with QR count)    |
| POST   | `/api/folders/`      | Yes  | Create folder `{ name, color }` |
| PUT    | `/api/folders/:id`   | Yes  | Update folder                   |
| DELETE | `/api/folders/:id`   | Yes  | Delete folder (unassigns QRs)   |

---

## Database Models

### User
- `id` (UUID, PK)
- `name`, `email` (unique), `password` (bcrypt hashed)
- Auto-hashes password on create/update via Sequelize hooks

### QRCode
- `id` (UUID, PK), `userId` (FK → User)
- `title`, `qrType`, `shortId` (unique), `targetUrl`, `content` (JSON)
- `scanCount`, `isActive`, `isFavorite`
- `description`, `expiresAt`, `maxScans`, `folderId` (FK → Folder)

### ScanEvent
- `id` (UUID, PK), `qrCodeId` (FK → QRCode)
- `ip`, `country`, `city`, `latitude`, `longitude`
- `browser`, `os`, `deviceType`, `referrer`, `scannedAt`

### Template
- `id` (UUID, PK), `userId` (FK → User)
- `name`, `fgColor`, `bgColor`

### Folder
- `id` (UUID, PK), `userId` (FK → User)
- `name`, `color`

---

## WebSocket Events

Socket.io is used for real-time scan notifications.

| Event   | Direction       | Payload                                          |
| ------- | --------------- | ------------------------------------------------ |
| `join`  | Client → Server | `userId` — joins user-specific room              |
| `scan`  | Server → Client | `{ qrTitle, qrType, shortId, country, city, browser, os, deviceType, scannedAt }` |

Clients connect and emit `join` with their user ID. When any of their QR codes is scanned, the server emits a `scan` event to their room.

---

## Logging

- **HTTP requests** — Morgan logs to Winston transport
- **Application logs** — Winston with daily rotating files in `logs/`
- **Log levels** — error, warn, info, debug
- **Format** — Timestamped JSON in files, colorized in console

---

## Environment Variables

| Variable                | Required | Default              | Description                  |
| ----------------------- | -------- | -------------------- | ---------------------------- |
| `PORT`                  | No       | 5000                 | Server port                  |
| `DB_NAME`               | Yes      | —                    | MySQL database name          |
| `DB_USER`               | Yes      | —                    | MySQL username               |
| `DB_PASSWORD`           | Yes      | —                    | MySQL password               |
| `DB_HOST`               | No       | 127.0.0.1            | MySQL host                   |
| `DB_PORT`               | No       | 3306                 | MySQL port                   |
| `JWT_SECRET`            | Yes      | —                    | JWT signing secret           |
| `NODE_ENV`              | No       | development          | Environment                  |
| `CLOUDINARY_CLOUD_NAME` | Yes      | —                    | Cloudinary cloud name        |
| `CLOUDINARY_API_KEY`    | Yes      | —                    | Cloudinary API key           |
| `CLOUDINARY_API_SECRET` | Yes      | —                    | Cloudinary API secret        |
| `FRONTEND_URL`          | No       | http://localhost:5173 | Allowed CORS origin          |

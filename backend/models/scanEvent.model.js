import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import QRCode from './qrcode.model.js';

const ScanEvent = sequelize.define('ScanEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  qrCodeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: QRCode,
      key: 'id',
    },
  },
  // Geolocation
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // Device info (parsed from User-Agent)
  browser: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceType: {
    type: DataTypes.STRING, // 'mobile', 'tablet', 'desktop'
    allowNull: true,
  },
  // Request metadata
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scannedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relationships
QRCode.hasMany(ScanEvent, { foreignKey: 'qrCodeId', as: 'scanEvents' });
ScanEvent.belongsTo(QRCode, { foreignKey: 'qrCodeId', as: 'qrCode' });

export default ScanEvent;

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.model.js';

const QRCode = sequelize.define('QRCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  sessionToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qrType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  targetUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT, 
    allowNull: true,
  },
  scanCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  maxScans: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  folderId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Setup relationships (constraints: false — we manage the FK manually to allow null userId)
User.hasMany(QRCode, { foreignKey: 'userId', as: 'qrcodes', constraints: false });
QRCode.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

export default QRCode;
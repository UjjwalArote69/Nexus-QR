import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.model.js';

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3b82f6',
  },
});

User.hasMany(Folder, { foreignKey: 'userId', as: 'folders' });
Folder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Folder-QRCode relationship will be set up in server.js after all models load
export default Folder;

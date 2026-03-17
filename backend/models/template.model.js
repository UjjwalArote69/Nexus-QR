import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './user.model.js';

const Template = sequelize.define('Template', {
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
  fgColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#000000',
  },
  bgColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#ffffff',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
Template.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Template;

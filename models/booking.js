const Sequelize = require("sequelize");
const sequelize = require("../database.js");
const DataTypes = Sequelize.DataTypes;

class Booking extends Sequelize.Model {}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    houseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paid: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sessionId: { type: Sequelize.DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "booking",
    timestamps: true,
  }
);

module.exports = Booking;

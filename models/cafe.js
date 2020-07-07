'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Cafe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Cafe.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address_city: DataTypes.STRING,
    address_dist: DataTypes.STRING,
    address_other: DataTypes.STRING,
    opening_hour: DataTypes.STRING,
    consumption_patterns: DataTypes.TEXT,
    rule: DataTypes.TEXT,
    other: DataTypes.TEXT,
    minimum_charge: DataTypes.STRING,
    facebook: DataTypes.STRING,
    instagram: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cafe',
    tableName: 'cafes'
  })
  return Cafe
}

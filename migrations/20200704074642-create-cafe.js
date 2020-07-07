'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Cafes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      tel: {
        type: Sequelize.STRING
      },
      address_city: {
        type: Sequelize.STRING
      },
      address_dist: {
        type: Sequelize.STRING
      },
      address_other: {
        type: Sequelize.STRING
      },
      opening_hour: {
        type: Sequelize.STRING
      },
      consumption_patterns: {
        type: Sequelize.TEXT
      },
      rule: {
        type: Sequelize.TEXT
      },
      other: {
        type: Sequelize.TEXT
      },
      minimum_charge: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      instagram: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Cafes')
  }
}

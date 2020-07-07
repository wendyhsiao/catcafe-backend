'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Images',
      Array.from({ length: 100 }, (image, index) => ({
        url: `https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}`,
        cafeId: Math.floor(index / 5) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })), {})
  },

  down: async (queryInterface, Sequelize) => {
    const option = { truncate: true, restartIdentity: true }
    await queryInterface.bulkDelete('Images', null, option)
  }
}

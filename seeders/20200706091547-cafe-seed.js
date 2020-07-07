'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Cafes',
      Array.from({ length: 20 }).map(cafe => ({
        name: faker.name.findName(),
        tel: faker.phone.phoneNumberFormat(),
        address_city: faker.address.county(),
        address_dist: faker.address.city(),
        address_other: faker.address.streetAddress(),
        opening_hour: '8:00 - 6:00',
        consumption_patterns: faker.lorem.sentences(),
        rule: faker.lorem.sentences(),
        other: faker.lorem.text(),
        minimum_charge: '150',
        facebook: faker.lorem.word(),
        instagram: faker.lorem.word(),
        createdAt: new Date(),
        updatedAt: new Date()
      })), {})
  },

  down: async (queryInterface, Sequelize) => {
    const option = { truncate: true, restartIdentity: true }
    await queryInterface.bulkDelete('Cafes', null, option)
  }
}

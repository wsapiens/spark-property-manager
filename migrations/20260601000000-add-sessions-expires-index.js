'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('Sessions', ['expires'], {
      name: 'sessions_expires_idx'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('Sessions', 'sessions_expires_idx');
  }
};

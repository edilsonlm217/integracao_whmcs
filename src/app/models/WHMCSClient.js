import Sequelize, { Model } from 'sequelize';

class WHMCSClient extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        firstname: Sequelize.STRING,
        lastname: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'tblclients',
      }
    );

    return this;
  }
}

export default WHMCSClient;

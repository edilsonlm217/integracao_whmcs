import Sequelize, { Model } from 'sequelize';

class Service extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        idlanc: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        valor: Sequelize.FLOAT,
        tipo: Sequelize.STRING,
        desc: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'sis_mlanc',
      }
    );

    return this;
  }
}

export default Service;

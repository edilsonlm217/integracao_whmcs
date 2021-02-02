import Sequelize, { Model } from 'sequelize';

class Invoice extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        userid: Sequelize.INTEGER,
        datepaid: Sequelize.STRING,
        status: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'tblinvoices',
      }
    );

    return this;
  }
}

export default Invoice;

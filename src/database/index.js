import Sequelize from 'sequelize';

import Client from '../app/models/Client';
import Invoice from '../app/models/Invoice';
import Service from '../app/models/Service';
import WHMCSClient from '../app/models/WHMCSClient';

import mkAuthDatabaseConfig from '../config/mk-auth-database';
import whmcsDatabaseConfig from '../config/whmcs-database';

const MkAuthModels = [Client, Service];
const WHMCSModels = [Invoice, WHMCSClient];

class Database {
  constructor() {
    this.init();
  }

  init() {
    try {
      this.mk_connection = new Sequelize(mkAuthDatabaseConfig);
      this.whmcs_connection = new Sequelize(whmcsDatabaseConfig);
    } catch (error) {
      console.log(error);
    }

    MkAuthModels.map(model => model.init(this.mk_connection));
    WHMCSModels.map(model => model.init(this.whmcs_connection));
  }
}

export default new Database();

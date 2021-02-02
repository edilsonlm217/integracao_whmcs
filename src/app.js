import mysql from 'mysql';
import { format } from 'date-fns';
import MySQLEvents from '@rodrigogs/mysql-events';

import Client from './app/models/Client';
import Invoice from './app/models/Invoice';
import Service from './app/models/Service';
import WHMCSClient from './app/models/WHMCSClient';

import './database';
import mkAuthDatabaseConfig from './config/mk-auth-database';

class App {
  constructor() {
    this.init();
  }

  init() {
    this.watchDatabase()
      .then(() => console.log('Waiting for database events...'))
      .catch(console.error);
  }

  async watchDatabase() {
    const connection = mysql.createConnection({
      host: mkAuthDatabaseConfig.host,
      password: 'vertrigo',
      port: 3306,
      user: mkAuthDatabaseConfig.username,
    });

    const instance = new MySQLEvents(connection, {
      startAtEnd: true,
      excludedSchemas: {
        mysql: true,
      },
    });

    await instance.start();

    instance.addTrigger({
      name: 'ON_INVOICE_IS_PAID',
      expression: 'mkradius.sis_lanc.status',
      statement: MySQLEvents.STATEMENTS.UPDATE,
      onEvent: async event => {
        const lancamento = event.affectedRows[0].after;

        // Verifica se a fatura precisa ser baixada no WHMCS
        if (lancamento.status === 'aberto') {
          return console.log('1 [INFO]: Esta fatura não precisa ser baixada no WHMCS');
        }

        const { login: user_login, id: idlanc, datavenc } = lancamento;

        const hasService = await Service.findOne({
          where: {
            idlanc,
          },
        });

        // Se fatura não tiver serviço atrelada a ela a execução para aqui
        if (!hasService) {
          return console.log('2 [INFO]: Esta fatura não precisa ser baixada no WHMCS');
        }

        const { desc } = hasService;

        let isIPTVService = desc.includes('IPTV');

        if (!isIPTVService) {
          isIPTVService = desc.includes('iptv');
          if (!isIPTVService) {
            return console.log('3 [INFO]: Esta fatura não precisa ser baixada no WHMCS');
          }
        }

        // Recupera o cadastro do cliente no Mk-Auth
        const { nome: client_name, email } = await Client.findOne({
          where: {
            login: user_login,
          },
        });

        // Recupera o cadastro do cliente no WHMCS
        const whmcs_client = await WHMCSClient.findOne({
          where: {
            email,
          },
        });

        // Recupera a invoice do cliente usando o userid (WHMCS)
        const invoice = await Invoice.findOne({
          where: {
            userid: whmcs_client.id,
            duedate: format(datavenc, 'yyyy-MM-dd'),
          },
        });

        // Verifica se a fatura busca existe
        if (!invoice) {
          return console.log('[INFO]: Fatura não cadastrada no WHMCS');
        }

        // Verifica se a fatura já está paga
        if (invoice.status === 'Paid') {
          return console.log('[INFO]: Não é possível dar baixa em faturas já pagas');
        }

        // Marca a invoice recuperada como paga
        invoice.datepaid = format(new Date(), 'yyyy-MM-dd');
        invoice.status = 'Paid';
        await invoice.save();
      },
    });
  }
}

export default new App();


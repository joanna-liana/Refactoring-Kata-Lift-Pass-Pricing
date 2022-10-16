import express from "express";
import mysql from "mysql2/promise";
import { MysqlPassRepository } from './passRepository';
import { MysqlHolidaysRepository } from './holidaysRepository';
import { calculatePassPrice, PassPriceParams } from './passPriceCalculator';

async function createApp() {
  const app = express();

  app.use(express.json());

  let connectionOptions = { host: 'localhost', user: 'root', database: 'lift_pass', password: 'mysql' };
  const connection = await mysql.createConnection(connectionOptions);

  const passRepository = new MysqlPassRepository(connection);
  const holidaysRepository = new MysqlHolidaysRepository(connection);

  app.put('/prices', async (req, res) => {
    const liftPassCost = req.query.cost;
    const liftPassType = req.query.type;
    const [rows, fields] = await connection.query(
      'INSERT INTO `base_price` (type, cost) VALUES (?, ?) ' +
      'ON DUPLICATE KEY UPDATE cost = ?',
      [liftPassType, liftPassCost, liftPassCost]);

    res.json();
  });

  app.get('/prices', async (req, res) => {
    const result = await calculatePassPrice({ passRepository, holidaysRepository }, req.query as unknown as PassPriceParams);

    res.json(result);
  });

  app.post('/prices', async (req, res) => {
    const multiPassParams = req.body?.passes as unknown as PassPriceParams[];

    const result = await Promise.all(
      multiPassParams
        .map(params => calculatePassPrice({ passRepository, holidaysRepository }, params)
        )
    );

    res.json({ result });
  });

  return { app, connection };
}

export { createApp };

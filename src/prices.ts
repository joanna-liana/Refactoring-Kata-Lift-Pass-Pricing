import express from "express";
import mysql from "mysql2/promise";
import { MysqlPassRepository } from './passRepository';
import { MysqlHolidaysRepository } from './holidaysRepository';

async function createApp() {
  const app = express();

  let connectionOptions = { host: 'localhost', user: 'root', database: 'lift_pass', password: 'mysql' };
  const connection = await mysql.createConnection(connectionOptions);

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
    await calculatePassPrice(connection, req, res);
  });
  return { app, connection };
}

export { createApp };

async function calculatePassPrice(connection: mysql.Connection, req, res) {
  const result = await new MysqlPassRepository(connection).getByType(req.query.type);

  if (req.query.age as any < 6) {
    res.json({ cost: 0 });
  } else {
    if (req.query.type !== 'night') {
      const holidays = await new MysqlHolidaysRepository(connection).getAll();

      let isHoliday;
      let reduction = 0;
      for (let row of holidays) {
        let holiday = row.holiday;
        let d = new Date(req.query.date as string);
        if (d.getFullYear() === holiday.getFullYear()
          && d.getMonth() === holiday.getMonth()
          && d.getDate() === holiday.getDate()) {

          isHoliday = true;
        }

      }

      if (!isHoliday && new Date(req.query.date as string).getDay() === 1) {
        reduction = 35;
      }

      // TODO apply reduction for others
      if (req.query.age as any < 15) {
        res.json({ cost: Math.ceil(result.cost * .7) });
      } else {
        if (req.query.age === undefined) {
          let cost = result.cost * (1 - reduction / 100);
          res.json({ cost: Math.ceil(cost) });
        } else {
          if (req.query.age as any > 64) {
            let cost = result.cost * .75 * (1 - reduction / 100);
            res.json({ cost: Math.ceil(cost) });
          } else {
            let cost = result.cost * (1 - reduction / 100);
            res.json({ cost: Math.ceil(cost) });
          }
        }
      }
    } else {
      if (req.query.age as any >= 6) {
        if (req.query.age as any > 64) {
          res.json({ cost: Math.ceil(result.cost * .4) });
        } else {
          res.json(result);
        }
      } else {
        res.json({ cost: 0 });
      }
    }
  }
}

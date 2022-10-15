import mysql from "mysql2/promise";

export async function getHolidays(connection: mysql.Connection) {
  return (await connection.query(
    'SELECT * FROM `holidays`'
  ))[0] as mysql.RowDataPacket[];
}

export interface HolidaysRepository {
  getHolidays(): Promise<unknown>;
}

export class MysqlHolidaysRepository implements HolidaysRepository {
  constructor(private readonly connection: mysql.Connection) {
  }

  async getHolidays() {
    return getHolidays(this.connection);
  }
}

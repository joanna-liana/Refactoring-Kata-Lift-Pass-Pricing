import mysql from "mysql2/promise";

export interface HolidaysRepository {
  getHolidays(): Promise<unknown>;
}

export class MysqlHolidaysRepository implements HolidaysRepository {
  constructor(private readonly connection: mysql.Connection) {
  }

  async getHolidays() {
    return (await this.connection.query(
      'SELECT * FROM `holidays`'
    ))[0] as mysql.RowDataPacket[];
  }
}

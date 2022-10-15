import mysql from "mysql2/promise";

export interface HolidaysRepository {
  getAll(): Promise<unknown>;
}

export class MysqlHolidaysRepository implements HolidaysRepository {
  constructor(private readonly connection: mysql.Connection) {
  }

  async getAll() {
    return (await this.connection.query(
      'SELECT * FROM `holidays`'
    ))[0] as mysql.RowDataPacket[];
  }
}

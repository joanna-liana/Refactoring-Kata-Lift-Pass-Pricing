import mysql from "mysql2/promise";

interface HolidayReadModel {
  holiday: Date;
}

export interface HolidaysRepository {
  getAll(): Promise<HolidayReadModel[]>;
}

export class MysqlHolidaysRepository implements HolidaysRepository {
  constructor(private readonly connection: mysql.Connection) {
  }

  async getAll() {
    return (await this.connection.query(
      'SELECT * FROM `holidays`'
    ))[0] as HolidayReadModel[];
  }
}

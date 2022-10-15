import mysql from "mysql2/promise";

export interface PassRepository {
  getByType(type: string): Promise<unknown>;
}

export class MysqlPassRepository implements PassRepository {
  constructor(private readonly connection: mysql.Connection) {
  }

  async getByType(type: string) {
    return (await this.connection.query(
      'SELECT cost FROM `base_price` ' +
      'WHERE `type` = ? ',
      [type]))[0][0];
  }
}

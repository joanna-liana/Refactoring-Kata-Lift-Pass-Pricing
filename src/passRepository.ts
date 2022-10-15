import mysql from "mysql2/promise";

export async function getPassByType(connection: mysql.Connection, type: string) {
  return (await connection.query(
    'SELECT cost FROM `base_price` ' +
    'WHERE `type` = ? ',
    [type]))[0][0];
}

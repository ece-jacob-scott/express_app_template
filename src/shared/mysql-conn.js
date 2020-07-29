const mysql = require("mysql");
const { promisify } = require("util");

const pool = mysql.createPool({
  host: process.env.MYSQL_IP,
  user: process.env.MYSQL_ACC,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  acquireTimeout: 1000,
  connectionLimit: 10,
  waitForConnections: false,
  queueLimit: 0,
});

module.exports.pool = pool;

module.exports.queryProm = promisify(pool.query).bind(pool);

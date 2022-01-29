const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'penta_note',
  password: 'penta',
  port: 5432,
})

async function query(query, params) {
  // console.log(query, params)
  const { rows, fields } = await pool.query(query, params);
  // console.log(rows)
  return rows;
}

module.exports = {
  query
}

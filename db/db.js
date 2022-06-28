const config = require("./config").config
const mysql = require('mysql')

const connection = mysql.createConnection(config.database)
connection.connect(err => {
  if (err) {
    throw err
  }
  console.log("Connected to the database.")
})

module.exports = connection
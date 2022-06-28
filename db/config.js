const dotenv = require("dotenv").config()

exports.config = {
    database: {
        multipleStatements  : true,
        host                : process.env.DB_HOST,
        user                : process.env.DB_USER,
        password            : process.env.DB_PASSWORD,
        database            : process.env.DB_DATABASE,
        port                : process.env.DB_PORT,
        isServer            : true
    }
}
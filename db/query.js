const connection = require("./db")

const query = (query, placeholder) => {
    return new Promise((resolve, reject) => {
        connection.query(query, placeholder, (err, results) => {
            if(err) reject(err)
            resolve(results)
        })
    })
}

module.exports = query
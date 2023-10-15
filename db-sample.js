const postgres = require('postgres');

const sql = postgres({
    user: "user",
    host: "host",
    database: "database",
    password: "password",
    port: 5432
});

module.exports = { sql };
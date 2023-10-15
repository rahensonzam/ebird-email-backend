const postgres = require('postgres');

const sql = postgres({
    user: "user",
    host: "host",
    database: "database",
    password: "password",
    port: 5432
});

async function myfunc() {

    const res = await sql`SELECT NOW()`;
    console.log("res", res);

}

myfunc();

module.exports = { sql };
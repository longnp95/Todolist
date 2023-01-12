const env = process.env;
const db = {
    host: env.DB_HOST || "localhost",
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "1111",
    database: env.DB_NAME || "todolist",
    port: env.DB_PORT || 3306,
};

export default db;
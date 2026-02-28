require("dotenv").config();
const sql = require("mssql");

const dbServer = process.env.DB_SERVER; // e.g. localhost or DESKTOP-XXXX
const dbInstance = process.env.DB_INSTANCE; // e.g. SQLEXPRESS or QUOCHUY1910
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;

// Auto-detect Azure SQL Database (requires encryption)
const isAzure = dbServer && dbServer.includes('.database.windows.net');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: dbServer,
    database: process.env.DB_NAME,
    options: {
        encrypt: isAzure ? true : false,
        trustServerCertificate: true
    }
};

// If a named instance is used and no port is provided, use server\instance.
if (dbInstance && !dbPort) {
    config.server = `${dbServer}\\${dbInstance}`;
} else if (dbInstance) {
    // If port is specified, keep server as host and set instanceName explicitly.
    config.options.instanceName = dbInstance;
}

if (dbPort) {
    config.port = dbPort;
}

const pool = new sql.ConnectionPool(config).connect();

const connectDB = async () => {
    try {
        await pool;
        console.log("✅ Connected to SQL Server");
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        console.error("ℹ️ Connection config (safe):", {
            user: config.user,
            server: config.server,
            database: config.database,
            port: config.port,
            options: config.options
        });
        throw err;
    }
};

module.exports = { sql, pool, connectDB };
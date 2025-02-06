const express = require('express');
const sql = require('mssql');
const app = express();

// Config your database credential
const config = {
    user: 'sa',
    password: 'tuan1106',
    server: 'DESKTOP-NF84Q32\\SQLSERVER',
    database: 'QLNHIEMVU',
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
    },
    cryptoCredentialsDetails: {
        ciphers: 'DEFAULT@SECLEVEL=0',
    }
};

// Create a connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('SQL Server connection error:', err);
});
// Graceful shutdown
process.on('SIGINT', () => {
    server.close(() => {
        pool.close();
        console.log('Server and SQL connection pool closed');
        process.exit(0);
    });
});

module.exports = { pool, poolConnect };

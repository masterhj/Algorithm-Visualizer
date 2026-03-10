const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'algorithm_visualizer',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');

        // Create tables if they don't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS visualizations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                algorithm_name VARCHAR(255) NOT NULL,
                algorithm_type VARCHAR(100) NOT NULL,
                array_size INT,
                comparisons INT DEFAULT 0,
                swaps INT DEFAULT 0,
                execution_time FLOAT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_algorithm (algorithm_name),
                INDEX idx_type (algorithm_type),
                INDEX idx_timestamp (timestamp)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS algorithm_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                algorithm_name VARCHAR(255) NOT NULL,
                avg_comparisons FLOAT,
                avg_swaps FLOAT,
                min_time FLOAT,
                max_time FLOAT,
                total_runs INT DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_algorithm (algorithm_name)
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pathfinding_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                algorithm_name VARCHAR(255) NOT NULL,
                grid_size VARCHAR(50),
                path_length INT,
                nodes_explored INT,
                execution_time FLOAT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_algorithm (algorithm_name),
                INDEX idx_timestamp (timestamp)
            )
        `);

        connection.release();
        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.warn('⚠️  MySQL Database Connection Failed:', error.code);
        console.warn('💡 The application will run without database persistence');
        console.warn('📝 To enable database features: Start MySQL and update .env credentials');
    }
}

// Initialize on module load - don't exit on error, just warn
initializeDatabase().catch(err => {
    console.warn('⚠️  Database initialization skipped - running in offline mode');
});

module.exports = pool;

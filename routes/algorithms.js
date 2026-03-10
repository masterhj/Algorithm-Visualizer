const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all algorithms info
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [algorithms] = await connection.execute(`
            SELECT DISTINCT algorithm_name, algorithm_type 
            FROM visualizations 
            ORDER BY algorithm_name
        `);
        connection.release();

        res.json(algorithms);
    } catch (error) {
        console.error('Error fetching algorithms:', error);
        res.status(500).json({ error: 'Failed to fetch algorithms' });
    }
});

// Get algorithm statistics
router.get('/stats/:algorithmName', async (req, res) => {
    try {
        const { algorithmName } = req.params;
        const connection = await pool.getConnection();

        const [stats] = await connection.execute(`
            SELECT 
                algorithm_name,
                avg_comparisons,
                avg_swaps,
                min_time,
                max_time,
                total_runs
            FROM algorithm_stats
            WHERE algorithm_name = ?
        `, [algorithmName]);

        connection.release();

        if (stats.length === 0) {
            return res.json({ message: 'No statistics found for this algorithm' });
        }

        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching algorithm stats:', error);
        res.status(500).json({ error: 'Failed to fetch algorithm statistics' });
    }
});

module.exports = router;

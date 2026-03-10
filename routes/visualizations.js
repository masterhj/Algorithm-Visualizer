const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Save sorting visualization result
router.post('/sorting', async (req, res) => {
    try {
        const {
            algorithmName,
            arraySize,
            comparisons,
            swaps,
            executionTime
        } = req.body;

        if (!algorithmName) {
            return res.status(400).json({ error: 'Algorithm name is required' });
        }

        try {
            const connection = await pool.getConnection();

            // Insert visualization record
            const [result] = await connection.execute(`
                INSERT INTO visualizations 
                (algorithm_name, algorithm_type, array_size, comparisons, swaps, execution_time)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [algorithmName, 'sorting', arraySize, comparisons, swaps, executionTime]);

            // Update or create algorithm stats
            const [existing] = await connection.execute(`
                SELECT * FROM algorithm_stats WHERE algorithm_name = ?
            `, [algorithmName]);

            if (existing.length > 0) {
                const stats = existing[0];
                const newTotalRuns = stats.total_runs + 1;
                const newAvgComparisons = ((stats.avg_comparisons * stats.total_runs) + comparisons) / newTotalRuns;
                const newAvgSwaps = ((stats.avg_swaps * stats.total_runs) + swaps) / newTotalRuns;
                const newMinTime = Math.min(stats.min_time || executionTime, executionTime);
                const newMaxTime = Math.max(stats.max_time || executionTime, executionTime);

                await connection.execute(`
                    UPDATE algorithm_stats 
                    SET avg_comparisons = ?, avg_swaps = ?, min_time = ?, max_time = ?, total_runs = ?
                    WHERE algorithm_name = ?
                `, [newAvgComparisons, newAvgSwaps, newMinTime, newMaxTime, newTotalRuns, algorithmName]);
            } else {
                await connection.execute(`
                    INSERT INTO algorithm_stats 
                    (algorithm_name, avg_comparisons, avg_swaps, min_time, max_time, total_runs)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [algorithmName, comparisons, swaps, executionTime, executionTime, 1]);
            }

            connection.release();

            res.status(201).json({
                message: 'Visualization saved successfully',
                id: result.insertId,
                database: 'connected'
            });
        } catch (dbError) {
            // Database is offline, but still respond with success (offline mode)
            console.log('📊 Database offline - visualization data not persisted');
            res.status(201).json({
                message: 'Visualization recorded (offline mode - not persisted)',
                algorithmName,
                arraySize,
                comparisons,
                swaps,
                executionTime,
                database: 'offline',
                note: 'Start MySQL to enable data persistence'
            });
        }
    } catch (error) {
        console.error('Error processing visualization:', error);
        res.status(500).json({ error: 'Failed to process visualization' });
    }
});

// Get all visualizations
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [visualizations] = await connection.execute(`
            SELECT * FROM visualizations 
            ORDER BY timestamp DESC 
            LIMIT 100
        `);
        connection.release();

        res.json(visualizations);
    } catch (error) {
        console.error('Error fetching visualizations:', error);
        res.status(500).json({ error: 'Failed to fetch visualizations' });
    }
});

// Get visualizations by algorithm type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const connection = await pool.getConnection();
        const [visualizations] = await connection.execute(`
            SELECT * FROM visualizations 
            WHERE algorithm_type = ?
            ORDER BY timestamp DESC 
            LIMIT 100
        `, [type]);
        connection.release();

        res.json(visualizations);
    } catch (error) {
        console.error('Error fetching visualizations:', error);
        res.status(500).json({ error: 'Failed to fetch visualizations' });
    }
});

// Save pathfinding result
router.post('/pathfinding', async (req, res) => {
    try {
        const {
            algorithmName,
            gridSize,
            pathLength,
            nodesExplored,
            executionTime
        } = req.body;

        if (!algorithmName) {
            return res.status(400).json({ error: 'Algorithm name is required' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.execute(`
            INSERT INTO pathfinding_results 
            (algorithm_name, grid_size, path_length, nodes_explored, execution_time)
            VALUES (?, ?, ?, ?, ?)
        `, [algorithmName, gridSize, pathLength, nodesExplored, executionTime]);

        connection.release();

        res.status(201).json({
            message: 'Pathfinding result saved successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error saving pathfinding result:', error);
        res.status(500).json({ error: 'Failed to save pathfinding result' });
    }
});

// Get statistics summary
router.get('/stats/summary', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [sortingStats] = await connection.execute(`
            SELECT algorithm_name, total_runs, avg_comparisons, avg_swaps 
            FROM algorithm_stats 
            ORDER BY total_runs DESC
        `);

        const [pathfindingStats] = await connection.execute(`
            SELECT algorithm_name, COUNT(*) as total_runs, AVG(execution_time) as avg_time
            FROM pathfinding_results 
            GROUP BY algorithm_name
            ORDER BY total_runs DESC
        `);

        connection.release();

        res.json({
            sorting: sortingStats,
            pathfinding: pathfindingStats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;

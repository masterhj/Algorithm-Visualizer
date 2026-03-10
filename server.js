const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Import routes
const algorithmRoutes = require('./routes/algorithms');
const visualizationRoutes = require('./routes/visualizations');

// Use routes
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/visualizations', visualizationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running', timestamp: new Date() });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Algorithm Visualizer Server running on http://localhost:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});

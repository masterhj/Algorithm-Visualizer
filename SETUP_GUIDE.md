# Algorithm Visualizer 3D with MySQL Backend

A beautiful, interactive 3D algorithm visualizer with MySQL database integration for tracking algorithm performance.

## Features

- **Sorting Algorithms**: Bubble Sort, Quick Sort, Merge Sort, Heap Sort, Insertion Sort, Selection Sort
- **Searching Algorithms**: Linear Search, Binary Search, Jump Search, Interpolation Search
- **Pathfinding Algorithms**: A*, Dijkstra's, BFS, DFS
- **Graph Visualization**: Visual representation of graph algorithms
- **Performance Tracking**: MySQL database stores all algorithm executions and statistics
- **Real-time Stats**: Comparisons, swaps, execution time tracking
- **Beautiful 3D UI**: Modern glass-morphism design with animations

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Installation & Setup

### 1. Install Node.js Dependencies

```bash
cd /path/to/Algorithm-Visualizer
npm install
```

### 2. Set Up MySQL Database

#### Option A: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE algorithm_visualizer;

# Exit MySQL
exit
```

#### Option B: Using MySQL Workbench or phpMyAdmin
- Create a new database named `algorithm_visualizer`

### 3. Configure Environment Variables

Edit the `.env` file in the root directory:

```bash
PORT=3001
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=algorithm_visualizer
MYSQL_PORT=3306
NODE_ENV=development
```

**Important**: Replace `your_mysql_password` with your actual MySQL password.

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3001`

## Usage

### Running the Application

1. Open your browser and navigate to `http://localhost:3001`
2. Select an algorithm category (Sorting, Searching, Pathfinding, or Graph)
3. Choose a specific algorithm from the dropdown
4. Adjust array size and speed using sliders
5. Click "Start" to begin visualization
6. Use "Pause/Resume" to control playback
7. Click "Reset" to clear the visualization

### Viewing Statistics

All algorithm executions are automatically saved to the MySQL database. You can view statistics by:

- Checking the browser console logs (after each visualization)
- Querying the database directly
- API endpoints (see API Documentation below)

## API Endpoints

### Visualizations

#### Save Sorting Visualization
```
POST /api/visualizations/sorting
```
Body:
```json
{
  "algorithmName": "bubble",
  "arraySize": 50,
  "comparisons": 1225,
  "swaps": 612,
  "executionTime": 2.45
}
```

#### Get All Visualizations
```
GET /api/visualizations
```

#### Get Visualizations by Type
```
GET /api/visualizations/type/sorting
```

#### Save Pathfinding Result
```
POST /api/visualizations/pathfinding
```
Body:
```json
{
  "algorithmName": "astar",
  "gridSize": "20x30",
  "pathLength": 25,
  "nodesExplored": 150,
  "executionTime": 0.85
}
```

### Statistics

#### Get Algorithm Statistics
```
GET /api/algorithms/stats/bubble
```

#### Get Statistics Summary
```
GET /api/visualizations/stats/summary
```

### Health Check
```
GET /api/health
```

## Database Schema

### visualizations Table
Stores all sorting and searching algorithm executions.

```sql
CREATE TABLE visualizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm_name VARCHAR(255) NOT NULL,
    algorithm_type VARCHAR(100) NOT NULL,
    array_size INT,
    comparisons INT DEFAULT 0,
    swaps INT DEFAULT 0,
    execution_time FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### algorithm_stats Table
Aggregated statistics for each algorithm.

```sql
CREATE TABLE algorithm_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm_name VARCHAR(255) NOT NULL UNIQUE,
    avg_comparisons FLOAT,
    avg_swaps FLOAT,
    min_time FLOAT,
    max_time FLOAT,
    total_runs INT DEFAULT 0
);
```

### pathfinding_results Table
Stores pathfinding algorithm results.

```sql
CREATE TABLE pathfinding_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm_name VARCHAR(255) NOT NULL,
    grid_size VARCHAR(50),
    path_length INT,
    nodes_explored INT,
    execution_time FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### MySQL Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check `.env` file has correct credentials
- Ensure database `algorithm_visualizer` exists

### Buttons Not Responding
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Check browser console for errors (F12)
- Verify server is running on port 3001

### Port Already in Use
If port 3001 is already in use, edit `.env` file to use a different port:
```
PORT=3002
```

### Database Tables Not Created
The tables are automatically created on first server run. If they don't appear:
1. Delete the database: `DROP DATABASE algorithm_visualizer;`
2. Restart the server to recreate it

## Project Structure

```
Algorithm-Visualizer/
├── index.html              # Main HTML file
├── server.js               # Express server
├── package.json            # Node dependencies
├── .env                    # Environment configuration
├── config/
│   └── database.js         # MySQL connection and initialization
├── routes/
│   ├── algorithms.js       # Algorithm endpoints
│   └── visualizations.js   # Visualization endpoints
├── js/
│   ├── api-client.js       # Frontend API client
│   ├── algorithms.js       # Algorithm implementations
│   ├── visualizer.js       # Visualization logic
│   └── utils.js            # Utility functions
└── css/
    └── style.css           # Styling
```

## Performance Tips

- Use smaller array sizes (10-50) for real-time visualization
- Increase speed for faster algorithms like merge sort
- Use pathfinding with smaller grids for better performance
- Run on a modern browser for best 3D performance (Chrome, Firefox, Edge)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- IE 11: ❌ Not supported

## Future Enhancements

- [ ] Graph algorithm visualization
- [ ] More sorting algorithms (Radix, Counting, Bucket Sort)
- [ ] Algorithm comparison mode
- [ ] Export visualization data as CSV
- [ ] Advanced filtering and search in statistics
- [ ] Real-time collaboration features

## License

MIT License

## Support

For issues and questions, please check the browser console (F12) for error messages.

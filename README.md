# Algorithm Visualizer 3D with MySQL

A beautiful, interactive 3D algorithm visualizer with MySQL database backend for tracking algorithm performance and statistics.

![Algorithm Visualizer](https://i.ibb.co/y86B7Wk/main-prj.png)

## 🎯 Features

### Algorithms
- **Sorting**: Bubble Sort, Quick Sort, Merge Sort, Heap Sort, Insertion Sort, Selection Sort
- **Searching**: Linear Search, Binary Search, Jump Search, Interpolation Search  
- **Pathfinding**: A*, Dijkstra's, BFS, DFS
- **Graph Visualization**: Visual graph algorithm demonstrations

### Features
- ✨ Beautiful 3D animations with glass-morphism UI
- 📊 Real-time performance tracking (comparisons, swaps, execution time)
- 💾 MySQL database integration for statistics
- 📈 Performance analytics and history
- 🎛️ Adjustable array size and speed controls
- ⏸️ Pause/Resume functionality
- 🌐 RESTful API for data persistence

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14+ ([Download](https://nodejs.org/))
- **MySQL** 5.7+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **npm** or **yarn**

### Installation (macOS/Linux)

```bash
# Navigate to project directory
cd /path/to/Algorithm-Visualizer

# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Edit .env with your MySQL credentials
nano .env

# Start the server
npm start
```

### Installation (Windows)

```bash
# Navigate to project directory  
cd C:\path\to\Algorithm-Visualizer

# Run setup
setup.bat

# Edit .env with your MySQL credentials
# Then start the server
npm start
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your MySQL credentials
PORT=3001
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=algorithm_visualizer
MYSQL_PORT=3306
NODE_ENV=development

# 3. Create MySQL database
mysql -u root -p
CREATE DATABASE algorithm_visualizer;
exit

# 4. Start server
npm start

# 5. Open http://localhost:3001 in browser
```

## 📖 Usage

1. **Select Algorithm Category**: Choose from Sorting, Searching, Pathfinding, or Graph
2. **Pick Algorithm**: Select specific algorithm from dropdown
3. **Configure**: Adjust array size and speed with sliders
4. **Visualize**: Click "Start" to begin animation
5. **Control**: Use Pause/Resume and Reset buttons
6. **Track**: Statistics are automatically saved to MySQL

## 📚 API Endpoints

### Sorting Visualizations
```bash
# Save sorting result
POST /api/visualizations/sorting
Body: {
  "algorithmName": "bubble",
  "arraySize": 50,
  "comparisons": 1225,
  "swaps": 612,
  "executionTime": 2.45
}

# Get all visualizations
GET /api/visualizations

# Get by type
GET /api/visualizations/type/sorting
```

### Algorithm Statistics
```bash
# Get algorithm stats
GET /api/algorithms/stats/bubble

# Get summary
GET /api/visualizations/stats/summary
```

### Pathfinding Results
```bash
POST /api/visualizations/pathfinding
Body: {
  "algorithmName": "astar",
  "gridSize": "20x30",
  "pathLength": 25,
  "nodesExplored": 150,
  "executionTime": 0.85
}
```

## 🗄️ Database Schema

### visualizations
```sql
- id: INT (Primary Key)
- algorithm_name: VARCHAR(255)
- algorithm_type: VARCHAR(100)
- array_size: INT
- comparisons: INT
- swaps: INT
- execution_time: FLOAT
- timestamp: DATETIME
```

### algorithm_stats
```sql
- id: INT (Primary Key)
- algorithm_name: VARCHAR(255) (UNIQUE)
- avg_comparisons: FLOAT
- avg_swaps: FLOAT
- min_time: FLOAT
- max_time: FLOAT
- total_runs: INT
```

### pathfinding_results
```sql
- id: INT (Primary Key)
- algorithm_name: VARCHAR(255)
- grid_size: VARCHAR(50)
- path_length: INT
- nodes_explored: INT
- execution_time: FLOAT
- timestamp: DATETIME
```

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **APIs**: RESTful

## 📁 Project Structure

```
Algorithm-Visualizer/
├── index.html                    # Main UI
├── server.js                     # Express server
├── package.json                  # Dependencies
├── .env                          # Configuration
├── setup.sh / setup.bat          # Setup scripts
├── config/
│   └── database.js              # MySQL connection
├── routes/
│   ├── algorithms.js            # Algorithm endpoints
│   └── visualizations.js        # Visualization endpoints
├── js/
│   ├── api-client.js            # API communication
│   ├── algorithms.js            # Algorithm implementations
│   ├── visualizer.js            # Visualization logic
│   └── utils.js                 # Utility functions
├── css/
│   └── style.css                # Styling
└── SETUP_GUIDE.md               # Detailed setup guide
```

## ⚙️ Configuration

Edit `.env` file to configure:

```bash
# Server
PORT=3001
NODE_ENV=development

# MySQL Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=algorithm_visualizer
MYSQL_PORT=3306
```

## 🐛 Troubleshooting

### Buttons not responding?
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12)
- Restart server

### MySQL connection error?
- Verify MySQL is running: `mysql -u root -p`
- Check .env credentials
- Database exists: `CREATE DATABASE algorithm_visualizer;`

### Port 3001 already in use?
Edit .env and change PORT to another number (3002, 3003, etc.)

### Database tables not created?
Tables are auto-created on first run. If issues:
```bash
DROP DATABASE algorithm_visualizer;
# Restart server - it will recreate all tables
```

## 📊 Performance Tips

- Use smaller array sizes (10-50) for smooth visualization
- Increase speed for better responsiveness
- Run on modern browser (Chrome, Firefox, Edge)
- Use pathfinding with smaller grids (10x15 to 20x30)

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Edge    | ✅ Full |
| Safari  | ✅ Full |
| IE 11   | ❌ No  |

## 🔮 Future Enhancements

- [ ] Advanced graph algorithms
- [ ] More sorting algorithms (Radix, Counting, Bucket)
- [ ] Algorithm comparison mode
- [ ] Export visualization as video/image
- [ ] Real-time multiplayer mode
- [ ] Advanced filtering in statistics dashboard

## 📄 License

MIT License - feel free to use this project

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

## 💬 Support

For issues and questions:
1. Check browser console (F12) for error messages
2. Review SETUP_GUIDE.md for detailed instructions
3. Verify MySQL is running and credentials are correct

---

**Enjoy visualizing algorithms! 🚀**

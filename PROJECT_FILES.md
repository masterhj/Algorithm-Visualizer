# Project File Structure & Overview

## 📁 Complete Project Layout

```
Algorithm-Visualizer/
│
├── 📄 Core Files
│   ├── server.js                 ← Express server (starts here)
│   ├── package.json              ← Node dependencies
│   └── .env                      ← MySQL configuration
│
├── 🗂️ config/
│   └── database.js               ← MySQL connection & initialization
│
├── 🛣️ routes/ (API Endpoints)
│   ├── algorithms.js             ← Algorithm statistics endpoints
│   └── visualizations.js         ← Save/retrieve visualization data
│
├── 🎨 Frontend
│   ├── index.html                ← Main UI (modified with API integration)
│   ├── css/
│   │   └── style.css             ← All styling
│   └── js/
│       ├── api-client.js         ← NEW: Frontend API client
│       ├── algorithms.js         ← Algorithm implementations
│       ├── visualizer.js         ← Visualization logic
│       └── utils.js              ← Utility functions
│
├── 🚀 Setup Scripts
│   ├── setup.sh                  ← macOS/Linux setup
│   └── setup.bat                 ← Windows setup
│
└── 📚 Documentation
    ├── START_HERE.md             ← READ THIS FIRST
    ├── QUICK_REFERENCE.md        ← Commands & shortcuts
    ├── README.md                 ← Overview & features
    ├── SETUP_GUIDE.md            ← Detailed setup
    ├── MYSQL_SETUP.md            ← MySQL installation
    ├── IMPLEMENTATION_SUMMARY.md ← Technical details
    └── This file                 ← File reference
```

## 📖 File Descriptions

### Core Server Files

#### `server.js` (Main Backend Entry Point)
- Express.js server configuration
- CORS enabled for frontend communication
- Static file serving (HTML, CSS, JS)
- Route mounting
- Error handling middleware
- **Start here to run the server**

#### `package.json` (Dependencies)
- Node.js project configuration
- Lists all npm dependencies:
  - express, mysql2, cors, body-parser, dotenv
- npm scripts: `start`, `dev` (with nodemon)
- **Run `npm install` to install dependencies**

#### `.env` (Configuration)
- Server port (default: 3001)
- MySQL connection details
- Environment mode (development/production)
- **MUST edit this with your MySQL password**

### Database Configuration

#### `config/database.js`
- Creates MySQL connection pool
- Auto-creates database tables on startup
- Connection pooling for better performance
- 3 tables: visualizations, algorithm_stats, pathfinding_results
- **Automatically initializes on server start**

### API Routes

#### `routes/algorithms.js`
Endpoints:
- `GET /api/algorithms` - List all algorithms
- `GET /api/algorithms/stats/:algorithmName` - Get algorithm statistics

#### `routes/visualizations.js`
Endpoints:
- `POST /api/visualizations/sorting` - Save sorting results
- `POST /api/visualizations/pathfinding` - Save pathfinding results
- `GET /api/visualizations` - Get all visualizations
- `GET /api/visualizations/type/:type` - Filter by type
- `GET /api/visualizations/stats/summary` - Get summary statistics

### Frontend Files

#### `index.html` (Main UI)
- Complete algorithm visualizer interface
- 3D animations and glass-morphism design
- Control panels for algorithm selection
- Visualization area with bars/grid
- **MODIFIED: Added API client link and saveVisualization() method**

#### `js/api-client.js` (NEW - Frontend API Client)
```javascript
- apiClient.saveSortingVisualization()     ← Call after sorting
- apiClient.savePathfindingResult()        ← Call after pathfinding
- apiClient.getVisualizationsByType()      ← Query results
- apiClient.getAlgorithmStats()            ← Get statistics
- apiClient.getStatisticsSummary()         ← Get summary
```

#### `js/algorithms.js` (Algorithm Implementations)
Contains all algorithm implementations:
- Sorting: Bubble, Quick, Merge, Heap, Insertion, Selection
- Searching: Linear, Binary, Jump, Interpolation
- Pathfinding: A*, Dijkstra, BFS, DFS
- **No changes needed here**

#### `js/visualizer.js` (Visualization Engine)
- Renders bars and grid
- Handles animations
- Updates statistics
- Manages playback (Start/Pause/Reset)
- **No changes needed here**

#### `js/utils.js` (Utilities)
- Array generation and shuffling
- Delay functions
- Helper methods
- **No changes needed here**

#### `css/style.css` (Styling)
- All visual styling
- 3D transforms and animations
- Responsive design
- **No changes needed here**

### Setup Scripts

#### `setup.sh` (macOS/Linux Setup)
```bash
chmod +x setup.sh
./setup.sh
```
- Checks Node.js installation
- Installs npm dependencies
- Creates .env file template
- **Run this first on macOS/Linux**

#### `setup.bat` (Windows Setup)
```bash
setup.bat
```
- Checks Node.js installation
- Installs npm dependencies
- Creates .env file template
- **Run this first on Windows**

### Documentation Files

#### `START_HERE.md` ⭐
- **Read this first!**
- Quick overview of changes
- How to run the project
- Checklist before running

#### `QUICK_REFERENCE.md`
- Common commands
- API endpoints
- MySQL queries
- Troubleshooting table

#### `README.md`
- Project overview
- Features list
- Installation instructions
- API documentation
- Browser compatibility

#### `SETUP_GUIDE.md`
- Detailed setup steps
- Configuration guide
- API endpoint documentation
- Database schema details

#### `MYSQL_SETUP.md`
- MySQL installation (all platforms)
- Initial setup instructions
- Troubleshooting guide
- Security recommendations

#### `IMPLEMENTATION_SUMMARY.md`
- Technical changes made
- Component descriptions
- Architecture overview
- Usage examples

## 🔄 Data Flow

```
User Browser
    ↓
index.html
    ↓
js/algorithms.js (Runs algorithm)
    ↓
js/visualizer.js (Shows animation)
    ↓
js/api-client.js (Sends data)
    ↓
server.js (Express)
    ↓
routes/visualizations.js (Process request)
    ↓
config/database.js (Store in MySQL)
    ↓
MySQL Database (Saves data)
```

## 🗄️ Database Tables

### visualizations Table
```
id (INT)
algorithm_name (VARCHAR)
algorithm_type (VARCHAR)
array_size (INT)
comparisons (INT)
swaps (INT)
execution_time (FLOAT)
timestamp (DATETIME)
```

### algorithm_stats Table
```
id (INT)
algorithm_name (VARCHAR UNIQUE)
avg_comparisons (FLOAT)
avg_swaps (FLOAT)
min_time (FLOAT)
max_time (FLOAT)
total_runs (INT)
```

### pathfinding_results Table
```
id (INT)
algorithm_name (VARCHAR)
grid_size (VARCHAR)
path_length (INT)
nodes_explored (INT)
execution_time (FLOAT)
timestamp (DATETIME)
```

## 📊 Dependency Tree

```
server.js
├── express (Web framework)
├── cors (Cross-origin requests)
├── body-parser (Parse JSON)
├── dotenv (Load .env)
└── routes/
    ├── algorithms.js
    │   └── config/database.js
    │       └── mysql2/promise (Database)
    └── visualizations.js
        └── config/database.js
            └── mysql2/promise (Database)
```

## 🎯 Key Changes Made

### ✅ Fixed
- Button event listeners working
- API integration added to UI

### ✅ Added
- Express server (`server.js`)
- MySQL database configuration
- API routes (2 files)
- Frontend API client (`api-client.js`)
- Setup automation (2 scripts)
- Comprehensive documentation (7 files)

### ✅ Modified
- `index.html` - Added API integration (2 additions)
- That's it! Everything else is new

## 🚀 Startup Sequence

When you run `npm start`:

1. **server.js** loads
2. **config/database.js** initializes:
   - Creates connection pool
   - Connects to MySQL
   - Creates tables (if needed)
3. **routes/** are mounted
4. Server listens on port 3001
5. **index.html** served when you visit browser
6. **js/api-client.js** loaded in browser
7. Ready for algorithm visualization!

## 💾 Save Sequence

When you run an algorithm:

1. Algorithm executes (js/algorithms.js)
2. Visualization updates (js/visualizer.js)
3. Algorithm completes
4. `saveVisualization()` called in index.html
5. **js/api-client.js** sends data to backend
6. **server.js** receives POST request
7. **routes/visualizations.js** processes request
8. **config/database.js** executes SQL
9. **MySQL** stores data
10. Frontend receives confirmation
11. Console logs "Saved successfully"

## 🔍 File Status

| File | Status | Purpose |
|------|--------|---------|
| server.js | ✅ NEW | Express backend |
| package.json | ✅ NEW | Dependencies |
| .env | ✅ NEW | Configuration |
| config/database.js | ✅ NEW | MySQL setup |
| routes/algorithms.js | ✅ NEW | API endpoints |
| routes/visualizations.js | ✅ NEW | API endpoints |
| js/api-client.js | ✅ NEW | Frontend API |
| index.html | ✏️ MODIFIED | Added API integration |
| js/algorithms.js | ✓ UNCHANGED | Algorithm logic |
| js/visualizer.js | ✓ UNCHANGED | Visualization |
| js/utils.js | ✓ UNCHANGED | Utilities |
| css/style.css | ✓ UNCHANGED | Styling |

## 📝 Total Changes

- ✅ 8 new backend files
- ✏️ 1 modified frontend file (2 additions)
- 📚 7 documentation files
- **~1000 lines of new code**
- **Zero breaking changes to UI**

## 🎓 Learning Structure

1. **Start** → START_HERE.md
2. **Setup** → SETUP_GUIDE.md or MYSQL_SETUP.md
3. **Reference** → QUICK_REFERENCE.md
4. **Details** → IMPLEMENTATION_SUMMARY.md
5. **Code** → Browse files listed above

---

**You now have a fully integrated Algorithm Visualizer with MySQL backend! 🎉**

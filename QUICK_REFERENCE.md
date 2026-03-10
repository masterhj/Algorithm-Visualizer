# Quick Reference - Algorithm Visualizer

## 🚀 Getting Started (30 seconds)

```bash
cd /Users/himanshujaiswal/Algorithm-Visualizer
chmod +x setup.sh        # macOS/Linux
./setup.sh              # Run setup

# Then edit .env with MySQL password:
nano .env               # Edit MYSQL_PASSWORD

npm start               # Start server
# Open: http://localhost:3001
```

**Windows Users**: Use `setup.bat` instead of `setup.sh`

## 📋 Checklist Before Running

- [ ] Node.js installed (`node --version`)
- [ ] MySQL installed and running
- [ ] `.env` file has MySQL password
- [ ] Database created: `CREATE DATABASE algorithm_visualizer;`
- [ ] Port 3001 is available

## 🎮 Using the App

| Action | How |
|--------|-----|
| Start | Click "Start" button |
| Pause | Click "Pause" button (toggles to Resume) |
| Reset | Click "Reset" button |
| Change Algorithm | Select from dropdown |
| Adjust Array Size | Use size slider |
| Change Speed | Use speed slider |
| New Array | Click "Generate Array" |

## 🔌 API Quick Reference

```bash
# Save sorting result
curl -X POST http://localhost:3001/api/visualizations/sorting \
  -H "Content-Type: application/json" \
  -d '{
    "algorithmName": "bubble",
    "arraySize": 50,
    "comparisons": 1225,
    "swaps": 612,
    "executionTime": 2.45
  }'

# Get all visualizations
curl http://localhost:3001/api/visualizations

# Get algorithm stats
curl http://localhost:3001/api/algorithms/stats/bubble

# Check server health
curl http://localhost:3001/api/health
```

## 🗄️ MySQL Quick Commands

```bash
# Connect
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE algorithm_visualizer;

# Show tables
SHOW TABLES;

# View visualizations
SELECT * FROM visualizations ORDER BY timestamp DESC LIMIT 10;

# View stats
SELECT * FROM algorithm_stats;

# Count records
SELECT COUNT(*) FROM visualizations;
```

## 📁 File Locations

| File | Purpose |
|------|---------|
| `server.js` | Main backend server |
| `config/database.js` | MySQL configuration |
| `routes/*.js` | API endpoints |
| `js/api-client.js` | Frontend API client |
| `index.html` | Main UI |
| `.env` | Configuration (MySQL credentials) |

## ⚙️ Environment Variables

```bash
PORT=3001                          # Server port
MYSQL_HOST=localhost               # MySQL server address
MYSQL_USER=root                    # MySQL username
MYSQL_PASSWORD=your_password       # MySQL password (CHANGE THIS!)
MYSQL_DATABASE=algorithm_visualizer # Database name
MYSQL_PORT=3306                    # MySQL port
NODE_ENV=development               # Environment
```

## 🆘 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot connect to MySQL" | Check MySQL is running: `mysql -u root -p` |
| "Port 3001 already in use" | Change PORT in .env file |
| "Access denied" | Verify MYSQL_PASSWORD in .env |
| "Buttons not working" | Clear cache (Ctrl+Shift+Del), restart browser |
| "Database not found" | Run: `CREATE DATABASE algorithm_visualizer;` |

## 🎯 Database Queries

```sql
-- Average stats by algorithm
SELECT algorithm_name, 
       COUNT(*) as runs,
       AVG(comparisons) as avg_comp,
       AVG(execution_time) as avg_time
FROM visualizations
GROUP BY algorithm_name;

-- Fastest sort
SELECT algorithm_name, 
       MIN(execution_time) as fastest_time
FROM visualizations
WHERE algorithm_type = 'sorting'
GROUP BY algorithm_name;

-- Recent executions
SELECT * FROM visualizations 
ORDER BY timestamp DESC LIMIT 5;

-- Algorithm efficiency
SELECT algorithm_name,
       array_size,
       comparisons / array_size as efficiency
FROM visualizations
ORDER BY efficiency ASC;
```

## 📊 Performance Tips

- Array Size: 10-50 (smaller = smoother)
- Speed: 5-10 (higher = faster)
- Algorithm: Bubble < Insertion < Quick/Merge/Heap
- Best Time: Off-peak hours for analysis

## 🔐 Security Notes

**For Development (This Project)**:
- Default user: root
- Store password in .env (not in code)
- Only accessible on localhost

**For Production (If Deploying)**:
1. Create non-root database user
2. Limit user privileges to one database
3. Use environment variables for all credentials
4. Enable SSL connections
5. Regular backups
6. Firewall rules

## 📞 Support Resources

- **Setup Issues**: See `SETUP_GUIDE.md`
- **MySQL Issues**: See `MYSQL_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Error Console**: Press F12 in browser

## 🎓 Project Structure

```
Algorithm-Visualizer/
├── server.js                 ← Start here
├── package.json             ← Dependencies
├── .env                     ← Configuration
├── config/database.js       ← DB setup
├── routes/                  ← API endpoints
├── js/                      ← Frontend logic
├── css/                     ← Styling
└── Docs:
    ├── README.md            ← Overview
    ├── SETUP_GUIDE.md       ← Detailed setup
    ├── MYSQL_SETUP.md       ← MySQL guide
    ├── IMPLEMENTATION_SUMMARY.md
    └── This file
```

## ✅ Verification Steps

```bash
# 1. Check Node.js
node --version           # Should be v14+

# 2. Check MySQL
mysql --version          # Should show version

# 3. Check dependencies
npm list                 # Should list all packages

# 4. Start server
npm start               # Should say "running on localhost:3001"

# 5. Test in browser
# Open http://localhost:3001
# Should load Algorithm Visualizer

# 6. Run algorithm
# Select algorithm > Click Start
# Check console for "saved to database"

# 7. Check database
mysql -u root -p
USE algorithm_visualizer;
SELECT COUNT(*) FROM visualizations;
# Should show count > 0
```

## 🎉 You're All Set!

Now you can:
- ✅ Visualize algorithms in 3D
- ✅ Track performance metrics
- ✅ Store results in MySQL
- ✅ Query statistics
- ✅ Analyze algorithm efficiency

**Happy visualizing! 🚀**

---

**Last Updated**: March 2026
**Version**: 1.0.0

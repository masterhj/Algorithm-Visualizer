# ✅ Complete Setup Checklist

## Before You Start

- [ ] Computer has internet connection
- [ ] Admin/sudo access available
- [ ] Have your MySQL root password ready (or will create new one)
- [ ] Port 3001 is available

## Step 1: Prerequisites Installation

### Check Node.js
```bash
node --version
npm --version
```
- [ ] Node.js v14+ installed
- [ ] npm included with Node.js

**If not installed**: https://nodejs.org/

### Check MySQL
```bash
mysql --version
```
- [ ] MySQL v5.7+ installed

**If not installed**:
- macOS: `brew install mysql`
- Windows: Download from https://dev.mysql.com/downloads/mysql/
- Linux: `sudo apt install mysql-server`

See `MYSQL_SETUP.md` for detailed instructions.

## Step 2: Navigate to Project

```bash
cd /Users/himanshujaiswal/Algorithm-Visualizer
```
- [ ] You're in the Algorithm-Visualizer directory
- [ ] You can see `server.js` and `package.json`

## Step 3: Run Setup Script

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```
- [ ] Script completes without errors
- [ ] npm packages installed
- [ ] .env file created

### Windows
```bash
setup.bat
```
- [ ] Script completes without errors
- [ ] npm packages installed
- [ ] .env file created

### Manual Alternative
```bash
npm install
```
- [ ] All dependencies installed
- [ ] No error messages

## Step 4: Configure MySQL Credentials

Edit `.env` file:
```bash
nano .env              # macOS/Linux
# or
notepad .env          # Windows
```

Find and update:
```
MYSQL_PASSWORD=your_actual_mysql_password
```

- [ ] .env file has your MySQL password
- [ ] Saved and closed

**Don't forget this step!** ⚠️

## Step 5: Create MySQL Database

Open MySQL:
```bash
mysql -u root -p
# Enter your MySQL password
```

Create database:
```sql
CREATE DATABASE algorithm_visualizer;
SHOW DATABASES;
exit
```

- [ ] Database `algorithm_visualizer` created
- [ ] Verified it appears in SHOW DATABASES
- [ ] Exited MySQL

## Step 6: Start the Server

```bash
npm start
```

Look for output:
```
Algorithm Visualizer Server running on http://localhost:3001
Environment: development
```

- [ ] Server started successfully
- [ ] No error messages
- [ ] Message shows port 3001
- [ ] Keep terminal open

## Step 7: Test in Browser

1. Open browser: `http://localhost:3001`
2. You should see the Algorithm Visualizer UI
3. Check that:
   - [ ] Page loads (you see title "Algorithm Visualizer 3D")
   - [ ] Animation area visible
   - [ ] Buttons visible (Start, Pause, Reset)
   - [ ] Sliders visible (Array Size, Speed)
   - [ ] Dropdown visible (Algorithm select)

## Step 8: Run Your First Algorithm

1. **Select Algorithm**: Choose "Bubble Sort" from dropdown
2. **Click Start**: Watch the visualization
3. **Let it complete**: Wait for "Algorithm Complete!" message
4. **Check browser console** (F12):
   - Look for: "Sorting visualization saved to database"
   - [ ] Console message appears

## Step 9: Verify Data Saved

Open another terminal (keep server running):
```bash
mysql -u root -p algorithm_visualizer
```

Check the data:
```sql
SELECT COUNT(*) FROM visualizations;
SHOW TABLES;
SELECT * FROM visualizations LIMIT 1;
exit
```

- [ ] Count shows at least 1 record
- [ ] Three tables exist (visualizations, algorithm_stats, pathfinding_results)
- [ ] One record appears with your algorithm data

## Step 10: Celebrate! 🎉

You have successfully:
- ✅ Fixed button click issues
- ✅ Installed Node.js backend
- ✅ Set up MySQL database
- ✅ Created API endpoints
- ✅ Integrated frontend and backend
- ✅ Saved algorithm data to database

## 🧪 Additional Testing

### Test Different Algorithms
```
1. Try Merge Sort
2. Try Linear Search
3. Try Quick Sort
4. Run each and verify data is saved
```

- [ ] Multiple algorithms tested
- [ ] Data saved for each

### Test API Endpoints

In browser console or terminal:
```bash
# Get all visualizations
curl http://localhost:3001/api/visualizations

# Get bubble sort stats
curl http://localhost:3001/api/algorithms/stats/bubble

# Health check
curl http://localhost:3001/api/health
```

- [ ] API endpoints respond with JSON
- [ ] No errors in response

### Test Database Queries

```bash
mysql -u root -p algorithm_visualizer

# Get statistics
SELECT algorithm_name, COUNT(*) as runs, 
       AVG(execution_time) as avg_time
FROM visualizations
GROUP BY algorithm_name;

# Get fastest sort
SELECT algorithm_name, MIN(execution_time) as fastest
FROM visualizations
WHERE algorithm_type = 'sorting'
GROUP BY algorithm_name;

exit
```

- [ ] Statistics queries work
- [ ] Results are meaningful

## 🔧 Troubleshooting Checklist

### If buttons don't work:
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Browser refreshed (F5)
- [ ] Server is running (check terminal)
- [ ] Console shows no errors (F12)

### If MySQL connection fails:
- [ ] MySQL is running (mysql -u root -p)
- [ ] .env file has correct password
- [ ] Database exists (CREATE DATABASE algorithm_visualizer;)
- [ ] Port 3306 is available

### If server won't start:
- [ ] npm packages installed (npm install)
- [ ] .env file exists and is readable
- [ ] Port 3001 is not in use (or change in .env)
- [ ] No typos in .env file

### If data not saving:
- [ ] Server console shows no errors
- [ ] Browser console shows API success message
- [ ] MySQL database connection works
- [ ] Tables exist (SHOW TABLES;)

## 📚 Next Steps After Setup

### Learn the System
- [ ] Read `PROJECT_FILES.md` for file structure
- [ ] Read `IMPLEMENTATION_SUMMARY.md` for technical details
- [ ] Explore the code

### Customize
- [ ] Change port in .env (if needed)
- [ ] Modify styling in css/style.css
- [ ] Add more algorithms

### Deploy (Optional)
- For production deployment, see security notes in MYSQL_SETUP.md

## 💾 Backup Recommended

After setup, back up your files:

```bash
# Create backup
zip -r algorithm-visualizer-backup.zip /Users/himanshujaiswal/Algorithm-Visualizer

# Or git commit
git add .
git commit -m "Initial setup with MySQL backend"
```

- [ ] Files backed up or committed to git

## 📋 Key Files to Remember

| File | Purpose | Action |
|------|---------|--------|
| `.env` | Config | **Keep secure**, don't share |
| `server.js` | Backend | Run with `npm start` |
| `index.html` | UI | Don't modify unless needed |
| `config/database.js` | DB Setup | Auto-runs on startup |

## ✅ Final Checklist

- [ ] All prerequisites installed
- [ ] Code downloaded and ready
- [ ] Setup script executed
- [ ] .env configured with MySQL password
- [ ] MySQL database created
- [ ] Server started with `npm start`
- [ ] Browser opens http://localhost:3001
- [ ] Algorithm runs successfully
- [ ] Data saves to MySQL
- [ ] API endpoints respond
- [ ] Database verified
- [ ] All tests passed
- [ ] Backup created

## 🎊 You're All Set!

Once all checkboxes are checked, you're ready to:
- Visualize algorithms in beautiful 3D
- Track algorithm performance
- Store results in MySQL database
- Query results via REST API
- Analyze statistics

**Congratulations! Your Algorithm Visualizer with MySQL is ready! 🚀**

---

## 📞 Help

If any checkbox fails:
1. Check the error message carefully
2. See troubleshooting section above
3. Read relevant documentation file
4. Check browser console (F12) for errors

**Need help?** Check these in order:
1. QUICK_REFERENCE.md
2. SETUP_GUIDE.md
3. MYSQL_SETUP.md
4. IMPLEMENTATION_SUMMARY.md
5. Browser console errors (F12)

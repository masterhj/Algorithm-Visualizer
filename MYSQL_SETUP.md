# MySQL Installation & Configuration Guide

## macOS Installation

### Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Verify installation
mysql --version

# Initial MySQL setup (recommended for security)
mysql_secure_installation
```

### Using DMG Installer

1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Choose "DMG Archive"
3. Run the installer and follow instructions
4. Start MySQL from System Preferences
5. Add MySQL to your PATH if needed:
   ```bash
   export PATH="/usr/local/mysql/bin:$PATH"
   ```

## Windows Installation

### Using MySQL Installer

1. Download from: https://dev.mysql.com/downloads/windows/installer/
2. Run `mysql-installer-community-*.msi`
3. Choose setup type:
   - **Server only** (recommended for this project)
   - Or **Developer Default** for all tools
4. Configure MySQL Server:
   - Port: 3306 (default)
   - Config Type: Development Machine
   - Connectivity: TCP/IP, Port 3306
5. Create MySQL Service (Windows Service)
6. Configure MySQL Server as Service
7. Set root password (remember it for .env file)
8. Complete installation

### Verify Installation (Windows)

```bash
# Open Command Prompt and test
mysql -u root -p
# Enter your password
mysql> SELECT VERSION();
mysql> exit
```

## Linux Installation

### Ubuntu/Debian

```bash
# Update package manager
sudo apt update

# Install MySQL Server
sudo apt install mysql-server

# Run security script
sudo mysql_secure_installation

# Verify installation
mysql --version

# Start MySQL service
sudo systemctl start mysql

# Enable auto-start on boot
sudo systemctl enable mysql

# Check status
sudo systemctl status mysql
```

### RedHat/CentOS

```bash
# Install MySQL Server
sudo yum install mysql-server

# Start MySQL service
sudo systemctl start mysqld

# Run security script
mysql_secure_installation

# Enable auto-start
sudo systemctl enable mysqld
```

## Initial Setup

### Access MySQL Command Line

```bash
# As root (first time, no password usually required on Linux)
mysql -u root

# After setting password
mysql -u root -p
# Enter your password when prompted
```

### Create Database for Algorithm Visualizer

```sql
-- Connect to MySQL first
-- mysql -u root -p

-- Create database
CREATE DATABASE algorithm_visualizer;

-- List databases to verify
SHOW DATABASES;

-- Exit
exit
```

## Configure .env File

Update your `.env` file with MySQL credentials:

```bash
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=algorithm_visualizer
MYSQL_PORT=3306
```

## Troubleshooting

### Can't connect to MySQL

**Problem**: `Can't connect to local MySQL server`

**Solutions**:
```bash
# Check if MySQL is running
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql

# Windows
# Check Services app (services.msc) - MySQL service should be running
```

### Access Denied

**Problem**: `Access denied for user 'root'@'localhost'`

**Solutions**:
```bash
# 1. Try without password (macOS/Linux first time)
mysql -u root

# 2. If password is forgotten (Windows)
# Stop MySQL, start without grant tables, reset password

# 3. Reset root password (macOS/Linux)
mysql -u root
> ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
> FLUSH PRIVILEGES;
```

### Port 3306 Already in Use

**Problem**: `Can't listen on port 3306`

**Solutions**:
```bash
# Change MySQL port in /etc/my.cnf or my.ini
# Find the line: port = 3306
# Change to: port = 3307

# Update .env file accordingly
MYSQL_PORT=3307
```

### MySQL Service Won't Start

**Solutions**:
```bash
# macOS
brew services restart mysql
# or
mysql.server start

# Linux
sudo systemctl restart mysql

# Windows
# Restart MySQL service from Services app
# Or via command line:
net stop MySQL80
net start MySQL80
```

## Verify Installation

```bash
# Test connection
mysql -u root -p -e "SELECT VERSION();"

# Test database creation
mysql -u root -p -e "CREATE DATABASE test; SHOW DATABASES;"

# Clean up
mysql -u root -p -e "DROP DATABASE test;"
```

## Security Recommendations

### For Development (This Project)

1. Set a strong root password (at least 12 characters)
2. Don't use the same password as other accounts
3. Only allow localhost connections (default, already set)

### For Production (If Deploying)

1. Disable remote root login
2. Create limited database users (not root)
3. Use environment variables for credentials
4. Enable MySQL slow query log
5. Regular backups
6. Firewall restrictions

## Quick Reference

| Task | Command |
|------|---------|
| Start MySQL | `brew services start mysql` (macOS) |
| Stop MySQL | `brew services stop mysql` (macOS) |
| Check Status | `brew services list \| grep mysql` (macOS) |
| Connect | `mysql -u root -p` |
| List Databases | `SHOW DATABASES;` |
| Create DB | `CREATE DATABASE name;` |
| Use DB | `USE database_name;` |
| Show Tables | `SHOW TABLES;` |
| Exit | `exit` or `\q` |

## Next Steps

1. ✅ Install MySQL
2. ✅ Create database `algorithm_visualizer`
3. ✅ Update .env with credentials
4. ✅ Return to main README for setup
5. ✅ Run `npm install` and `npm start`

For more information, visit: https://dev.mysql.com/doc/

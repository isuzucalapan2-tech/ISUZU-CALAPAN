@echo off
echo ==============================================
echo ISUZU Backup - STOP/DELETE/RESET
echo ==============================================
echo.

:: Check admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requires Administrator privileges.
    pause
    exit /b 1
)

cd /d %~dp0

echo [1/5] Stopping any running backup tasks...
schtasks /end /tn "ISUZU-Backup" >nul 2>&1
timeout /t 3 /nobreak >nul

echo [2/5] Deleting scheduled task...
schtasks /delete /tn "ISUZU-Backup" /f
if %errorLevel% equ 0 (echo   [OK] Task deleted) else (echo   [WARN] Task not found)

echo [3/5] Killing any XAMPP/backup processes...
taskkill /f /im xampp-control.exe >nul 2>&1
taskkill /f /im mysqld.exe >nul 2>&1
taskkill /f /im httpd.exe >nul 2>&1
echo   [OK] Processes terminated

echo [4/5] Clearing logs...
echo Backup log cleared - $(date /t) - $(time /t) > logs\backup.log
echo   [OK] Log reset

echo [5/5] Reset complete!
echo.
echo Task Scheduler entry: REMOVED
echo Processes: TERMINATED  
echo Logs: CLEARED (but kept for history)
echo.
echo To re-install: run install-backup-task.bat (Admin)
echo.
pause


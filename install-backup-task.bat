@echo off
echo ==============================================
echo ISUZU Backup Task Installer
echo ==============================================
echo.

:: Run as admin check
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

cd /d %~dp0

:: Delete existing task if present
schtasks /delete /tn "ISUZU-Backup" /f >nul 2>&1

:: Create scheduled task: Saturday 16:00 (4PM)
schtasks /create /tn "ISUZU-Backup" /tr "powershell.exe -ExecutionPolicy Bypass -File \"%~dp0backup-manager.ps1\"" /sc weekly /d SAT /st 16:00 /ru SYSTEM /rl highest /f

if %errorLevel% equ 0 (
    echo [OK] Backup task created successfully!
    echo Task Name: ISUZU-Backup
    echo Schedule: Every Saturday at 4:00 PM
    echo.
    echo To test: schtasks /run /tn "ISUZU-Backup"
    echo To view log: type logs\backup.log
    echo To check status: schtasks /query /tn "ISUZU-Backup"
) else (
    echo [ERROR] Failed to create task
)

echo.
pause


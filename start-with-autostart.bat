@echo off
echo ==============================================
echo ISUZU App - PM2 Auto-Start Setup
echo ==============================================
echo.

cd /d %~dp0

echo Step 1: Starting services with PM2...
pm2 start ecosystem.config.cjs
echo.

echo Step 2: Saving PM2 process list...
pm2 save
echo.

echo Step 3: Setting up Windows auto-start with PM2...
echo.

:: Create PowerShell script for shortcut creation
echo $WshShell = New-Object -ComObject WScript.Shell > "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\ISUZU-App-Startup.lnk") >> "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut.TargetPath = "%~dp0pm2.cmd" >> "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut.Arguments = "start ecosystem.config.cjs" >> "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut.WorkingDirectory = "%~dp0" >> "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut.Description = "ISUZU App Auto-Start" >> "%TEMP%\create_isuzu_shortcut.ps1"
echo $Shortcut.Save() >> "%TEMP%\create_isuzu_shortcut.ps1"
echo Write-Host "Shortcut created successfully" >> "%TEMP%\create_isuzu_shortcut.ps1"

:: Run PowerShell script to create shortcut
powershell -ExecutionPolicy Bypass -File "%TEMP%\create_isuzu_shortcut.ps1"

:: Clean up temp script
del "%TEMP%\create_isuzu_shortcut.ps1"

echo [OK] Startup shortcut created!
echo.

echo ==============================================
echo Setup Complete!
echo.
echo To manually start now: double-click start.bat
echo To check status: pm2 status
echo ==============================================
echo.
pause


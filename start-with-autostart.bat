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

:: Create startup shortcut in user's startup folder
echo Creating startup shortcut in user's startup folder...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: Create a VBS script for silent batch execution
echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\isuzu_run.vbs"
echo strPath = WshShell.ExpandEnvironmentStrings("%%CD%%") >> "%TEMP%\isuzu_run.vbs"
echo WshShell.Run strPath ^& "\pm2.cmd start ecosystem.config.cjs", 0, False >> "%TEMP%\isuzu_run.vbs"

:: Create the shortcut using PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\ISUZU-App-Startup.lnk'); $Shortcut.TargetPath = 'wscript.exe'; $Shortcut.Arguments = '\"%TEMP%\isuzu_run.vbs\"'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Description = 'ISUZU App Auto-Start'; $Shortcut.Save()"

echo [OK] Startup shortcut created!
echo.

echo ==============================================
echo Setup Complete!
echo.
echo The app will now automatically start when Windows boots.
echo.
echo To manually start now: double-click start.bat
echo To check status: pm2 status
echo To view logs: pm2 logs
echo To stop: pm2 stop all
echo To restart: pm2 restart all
echo.
echo Access the app at:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:3001
echo.
echo To access via network IP:
echo - Use your computer's IP address (e.g., http://192.168.x.x:5173)
echo ==============================================
echo.
pause

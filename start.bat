@echo off
echo Starting ISUZU App...
echo.
echo Starting Frontend (Vite) and Backend (Express) with PM2...
echo.

cd /d %~dp0

pm2 start ecosystem.config.cjs

echo.
echo ==============================================
echo ISUZU App is now running!
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo.
echo To view PM2 status: pm2 status
echo To view logs: pm2 logs
echo To stop: pm2 stop all
echo ==============================================
echo.

pm2 save

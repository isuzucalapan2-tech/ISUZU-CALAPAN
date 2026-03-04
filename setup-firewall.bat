@echo off
:: Run as Administrator to add firewall rules
netsh advfirewall firewall add rule name="ISUZU Frontend" dir=in action=allow protocol=tcp localport=5173
netsh advfirewall firewall add rule name="ISUZU Backend" dir=in action=allow protocol=tcp localport=3001
echo Firewall rules added successfully!
pause

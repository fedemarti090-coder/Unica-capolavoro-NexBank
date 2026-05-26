@echo off

cd /d "%~dp0"

start "Server-V2" cmd /k "cd .\Server-V2 && ..\..\launcher\bin\node.exe server.js"

start "Local-App" cmd /k "cd .\Local-App && ..\..\launcher\bin\node.exe node_modules/electron/cli.js ."

exit

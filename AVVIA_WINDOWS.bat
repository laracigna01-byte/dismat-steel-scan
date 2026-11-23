@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8767/"
  py -3 -m http.server 8767 --bind 127.0.0.1
  goto fine
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8767/"
  python -m http.server 8767 --bind 127.0.0.1
  goto fine
)
echo.
echo Per avviare DISMAT Steel Scan serve Python installato su Windows.
echo Se Python non e' disponibile, apri la cartella da VS Code e usa un server locale.
echo.
pause
:fine
endlocal

@echo off
REM ===========================================
REM  3-PUSH.cmd  -  Push su GitHub (usa HTTPS + Git Credential Manager)
REM  MAI usare dentro TRAE! Esegui DOPPIO CLICK in Windows.
REM ===========================================
setlocal
cd /d "%~dp0"
set "LOGFILE=%~dp0LOG-3-PUSH.txt"

echo. > %LOGFILE%
echo =========================================== >> %LOGFILE%
echo 3-PUSH.cmd AVVIATO %date% %time% >> %LOGFILE%
echo =========================================== >> %LOGFILE%
echo WORKDIR: %cd% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- GIT STATUS (before) --- >> %LOGFILE%
git status -sb >> %LOGFILE% 2>>&1

echo. >> %LOGFILE%
echo --- GIT REMOTE -v --- >> %LOGFILE%
git remote -v >> %LOGFILE% 2>>&1

echo. >> %LOGFILE%
echo --- GIT PUSH ORIGIN MAIN (HTTPS + Windows Credential Manager) --- >> %LOGFILE%
git push origin main >> %LOGFILE% 2>>&1
set EXITCODE=%ERRORLEVEL%
echo EXIT PUSH=%EXITCODE% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- GIT STATUS (after) --- >> %LOGFILE%
git status -sb >> %LOGFILE% 2>>&1
echo HASH HEAD:   >> %LOGFILE%
git rev-parse HEAD >> %LOGFILE% 2>>&1
echo HASH ORIGIN: >> %LOGFILE%
git rev-parse origin/main >> %LOGFILE% 2>>&1

echo.
if %EXITCODE% EQU 0 (
  echo ★★★ PUSH OK ★★★
  echo.
  echo Prossimi step:
  echo   1. Attendi ~2 minuti che Render auto-deployi
  echo   2. Se dopo 2 minuti non e' partito:
  echo      Apri https://dashboard.render.com  -^> Servizio arredi -^> Manual Deploy -^> Deploy latest commit
  echo   3. Apri https://arredi.onrender.com e fai Ctrl+F5 per refresh cache
) else (
  echo ✗ PUSH FALLITO (EXIT %EXITCODE%)
  echo.
  echo Motivo piu' frequente: la finestra di Git Credential Manager e' comparsa MA l'hai chiusa o ti sei sbagliato account.
  echo Riprova DOPPIO CLICK 3-PUSH.cmd e scegli account bolognacarmine-cell quando ti chiede.
  echo.
  echo Log COMPLETO in: %LOGFILE%
)
echo.
pause
endlocal

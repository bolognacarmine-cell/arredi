@echo off
REM ===========================================
REM  2-COMMIT.cmd  -  Crea commit locale (Solo modifiche tracciate)
REM ===========================================
setlocal
cd /d "%~dp0"
set "LOGFILE=%~dp0LOG-2-COMMIT.txt"

echo. > %LOGFILE%
echo =========================================== >> %LOGFILE%
echo 2-COMMIT.cmd AVVIATO %date% %time% >> %LOGFILE%
echo =========================================== >> %LOGFILE%
echo WORKDIR: %cd% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- GIT STATUS BEFORE --- >> %LOGFILE%
git status -sb >> %LOGFILE% 2>>&1

echo. >> %LOGFILE%
echo --- GIT ADD (solo file modificati tracciati) --- >> %LOGFILE%
git add -u >> %LOGFILE% 2>>&1
echo EXIT ADD=%ERRORLEVEL% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- GIT STATUS AFTER ADD --- >> %LOGFILE%
git status --short >> %LOGFILE% 2>>&1

echo. >> %LOGFILE%
echo --- GIT COMMIT --- >> %LOGFILE%
git commit -m "Fix video invisibile + 404 eliminati: HeroBackgroundVideo wrapper absolute inset-0, z-index espliciti Home, rimosse sorgenti inesistenti (hq/vp9/av1)" >> %LOGFILE% 2>>&1
set EXITCODE=%ERRORLEVEL%
echo EXIT COMMIT=%EXITCODE% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- HASH CONFRONTO --- >> %LOGFILE%
echo HEAD:   >> %LOGFILE%
git rev-parse HEAD >> %LOGFILE% 2>>&1
echo ORIGIN: >> %LOGFILE%
git rev-parse origin/main >> %LOGFILE% 2>>&1
echo STATUS: >> %LOGFILE%
git status -sb >> %LOGFILE% 2>>&1

echo.
if %EXITCODE% EQU 0 (
  echo ★ COMMIT OK (EXIT 0) ★
  echo.
  echo Adesso fai DOPPIO CLICK su:  3-PUSH.cmd
) else (
  echo ✗ COMMIT FALLITO (EXIT %EXITCODE%)
  echo (Se 'nothing added to commit' vuol dire che non ci sono modifiche da committare)
)
echo.
echo Log completo: %LOGFILE%
echo.
pause
endlocal

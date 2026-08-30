@echo off
REM ===========================================
REM  1-BUILD.cmd  -  Build Vite in produzione
REM  DOPPIO CLICK SEMPRE! (cd forza automatico)
REM ===========================================
setlocal
cd /d "%~dp0"
set "LOGFILE=%~dp0LOG-1-BUILD.txt"

echo. > %LOGFILE%
echo =========================================== >> %LOGFILE%
echo 1-BUILD.cmd AVVIATO %date% %time% >> %LOGFILE%
echo =========================================== >> %LOGFILE%
echo WORKDIR: %cd% >> %LOGFILE%

echo. >> %LOGFILE%
echo --- npm run build --- >> %LOGFILE%
call npm run build >> %LOGFILE% 2>>&1
set EXITCODE=%ERRORLEVEL%

echo. >> %LOGFILE%
echo EXIT BUILD: %EXITCODE% >> %LOGFILE%

if %EXITCODE% EQU 0 (
  echo BUILD OK (EXIT 0) - puoi eseguire 2-COMMIT.cmd adesso >> %LOGFILE%
  echo.
  echo ★ BUILD OK ★
  echo Log completo in: %LOGFILE%
  echo Adesso fai DOPPIO CLICK su 2-COMMIT.cmd
) else (
  echo BUILD FALLITA - Vedi LOG-1-BUILD.txt >> %LOGFILE%
  echo.
  echo ✗ BUILD FALLITA
  echo Apri %LOGFILE% per vedere l'errore
)
echo.
pause
endlocal

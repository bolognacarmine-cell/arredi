@echo off
REM =====================================================================
REM  ESEGUI-QUI.cmd  →  DOPPIO CLICK SEMPRE. Nessun input da tastiera.
REM =====================================================================
setlocal
set "LOG=%~dp0DIAG-CMD-VERO.txt"

REM SCRIVIAMO SUBITO IL LOG (prima di ogni cosa)
echo START > "%LOG%" 2>nul
echo ============================================================ >> "%LOG%"
echo  DIAGNOSTICA CMD VERO - %date% %time%                      >> "%LOG%"
echo  CARTELLA DOVE SONO IO: %~dp0                              >> "%LOG%"
echo ============================================================ >> "%LOG%"

REM Forziamo la working directory
cd /d "%~dp0" >> "%LOG%" 2>>&1
echo. >> "%LOG%"
echo [1] GIT VERSIONE >> "%LOG%"
git --version >> "%LOG%" 2>>&1
echo EXIT=%ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo [2] REMOTE URL >> "%LOG%"
git remote -v >> "%LOG%" 2>>&1
echo EXIT=%ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo [3] PUSH DRY-RUN (non invia nulla) >> "%LOG%"
git push --dry-run origin main >> "%LOG%" 2>>&1
echo EXIT=%ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo [4] CREDENTIAL HELPER >> "%LOG%"
git config --list --show-origin 2>>&1 | findstr /i "credential" >> "%LOG%" 2>>&1
echo EXIT=%ERRORLEVEL% >> "%LOG%"

echo. >> "%LOG%"
echo [5] HASH LOCALE vs GITHUB >> "%LOG%"
echo HEAD locale:   >> "%LOG%"
git rev-parse HEAD >> "%LOG%" 2>>&1
echo origin/main:   >> "%LOG%"
git rev-parse origin/main >> "%LOG%" 2>>&1

echo. >> "%LOG%"
echo [6] ULTIMI 3 COMMIT >> "%LOG%"
git log --oneline -n 3 >> "%LOG%" 2>>&1

echo. >> "%LOG%"
echo [7] GIT STATUS -sb >> "%LOG%"
git status -sb >> "%LOG%" 2>>&1

echo. >> "%LOG%"
echo ============================================================ >> "%LOG%"
echo FINE DIAGNOSTICA - %date% %time%                            >> "%LOG%"
echo ============================================================ >> "%LOG%"

REM Messaggio a video (rimane 5 secondi poi chiude)
cls
echo.
echo ============================================================
echo  Fatto !! Diagnostica CMD VERO completata.
echo ============================================================
echo.
echo  File di output: %LOG%
echo.
echo  Torna in TRAE e scrivi:   OK
echo.
timeout /t 7 >nul
endlocal
exit /b 0

@echo off
REM ============================================================
REM   PUSH SICURO - ESEGUILO FUORI DAL TERMINALE TRAE !!!
REM   Come?  Apri Esplora File in C:\Users\Acer\Desktop\arredi
REM          e fai DOPPIO CLICK su questo file.
REM ============================================================
chcp 65001 >nul
title (SICURO) Push GitHub Hero Video 1.06MB
cd /d "%~dp0"

set LOGFILE=%~dp0__PUSH-RISULTATO.txt
echo [%date% %time%] Inizio push su origin/main > "%LOGFILE%"
echo. >> "%LOGFILE%"
echo === git status === >> "%LOGFILE%"
git status -sb >> "%LOGFILE%" 2>>&1
echo. >> "%LOGFILE%"
echo === git push origin main === >> "%LOGFILE%"
git push origin main >> "%LOGFILE%" 2>>&1

set EX=%ERRORLEVEL%
echo. >> "%LOGFILE%"
echo === Exit code: %EX% === >> "%LOGFILE%"

if %EX% EQU 0 (
  echo [%date% %time%] PUSH RIUSCITO !!! >> "%LOGFILE%"
  echo.
  echo.
  echo    +=======================================+
  echo    !!!!!!!!!  PUSH COMPLETATO OK  !!!!!!!!!!
  echo    +=======================================+
  echo.
  echo    Il nuovo sito con il video hero sta per
  echo    essere deployato su Render.com in automatico.
  echo.
  echo    Risultato completo: %LOGFILE%
  echo.
) else (
  echo [%date% %time%] PUSH FALLITO exit=%EX% >> "%LOGFILE%"
  echo.
  echo.
  echo    X=======================================X
  echo    ??????   PUSH FALLITO exit=%EX%   ???????
  echo    X=======================================X
  echo.
  echo    Apri nel TRAE questo file e mandami il contenuto:
  echo    %LOGFILE%
  echo.
)
echo.
echo Premi un tasto per chiudere...
pause >nul
exit %EX%

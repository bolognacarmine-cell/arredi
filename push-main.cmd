@echo off
chcp 65001 >nul
title Push GitHub - arredi main
cd /d "%~dp0"

set LOG=%~dp0push-log.txt
set ERR=%~dp0push-err.txt
set EXCODE=%~dp0push-exit.txt

del /q "%LOG%" "%ERR%" "%EXCODE%" 2>nul

echo.
echo =====================================================
echo   PUSH automatico su origin/main
echo   Cartella: %cd%
echo   Log: %LOG%
echo =====================================================
echo.

git status --short --branch >>"%LOG%" 2>>"%ERR%"
type "%LOG%" 2>nul
echo.
echo --- Esecuzione: git push origin main ---
echo   (output completo in push-log.txt)
echo.

git push origin main >>"%LOG%" 2>>"%ERR%"

set EX=%ERRORLEVEL%
echo %EX% > "%EXCODE%"

echo.
echo --- Fine push. Exit code = %EX% ---
echo.
if "%EX%" EQU "0" (
  echo.
  echo   +++ PUSH OK +++
  echo   Adesso Render.com parte in automatico con il deploy.
  echo   Log completo: %LOG%
) else (
  echo.
  echo   !!! PUSH FALLITO exit=%EX%
  echo.
  echo   Vai nel TRAE, messaggio successivo mostrera'
  echo   il contenuto di push-log.txt e push-err.txt.
  echo.
)
echo.
pause

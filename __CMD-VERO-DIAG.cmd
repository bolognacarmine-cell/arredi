@echo off
REM =====================================================================
REM  __CMD-VERO-DIAG.cmd
REM  Da ESEGUIRE in Esplora File di Windows, DOPPIO CLICK.
REM  NON dentro la scheda Terminale di TRAE.
REM =====================================================================
setlocal ENABLEDELAYEDEXPANSION
cd /d "%~dp0"
set "LOG=%~dp0__CMD-VERO-OUTPUT.txt"

echo.
echo ===============================================================
echo   DIAGNOSTICA CMD VERO - OUTPUT SALVATO IN:
echo   %LOG%
echo ===============================================================
echo.

(
echo ===============================================================
echo   DIAGNOSTICA CMD VERO  -  %date%  %time%
echo   WORKDIR FORZATO A: %cd%
echo ===============================================================
echo.
echo 1) GIT VERSIONE INSTALLATA:
git --version
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 2) GIT REMOTE (URL del repository)
echo ===============================================================
git remote -v
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 3) GIT PUSH --DRY-RUN  (NESSUN UPLOAD VERO, solo AUTENTICAZIONE)
echo ===============================================================
git push --dry-run origin main
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 4) CREDENTIAL HELPER ATTIVI (quello che salva le credenziali)
echo ===============================================================
git config --list --show-origin | findstr /i "credential"
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 5) ULTIMI 5 COMMIT  (gli hash per confrontare)
echo ===============================================================
git log --oneline -n 5
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 6) CONFRONTO HASH  (locale HEAD vs origin/main su GitHub)
echo ===============================================================
echo LOCALE (questo PC):
git rev-parse HEAD
echo EXIT=%ERRORLEVEL%
echo GITHUB ONLINE:
git rev-parse origin/main
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 7) PATH di GIT (eseguibile che stai usando)
echo ===============================================================
where git
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo 8) GIT STATUS  (modifiche nel working tree)
echo ===============================================================
git status -sb
echo EXIT=%ERRORLEVEL%
echo.
echo ===============================================================
echo FINE DIAGNOSTICA.  %date%  %time%
echo ===============================================================
) > "%LOG%" 2>>&1

echo.
echo Fatto. Output completo salvato in:
echo %LOG%
echo.
echo Puoi chiudere questa finestra. Torna in TRAE e dimmi "ho finito".
echo.
pause
endlocal

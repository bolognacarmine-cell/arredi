@echo off
REM Script per schiarire un video usando FFmpeg
REM Uso: brighten-video.bat [input_file] [brightness_value]
REM brightness_value: 0.1 = 10% increase, 0.2 = 20% increase (default: 0.15)

setlocal

REM Parametri
set "INPUT_FILE=%~1"
set "BRIGHTNESS=%~2"

REM Valori di default
if "%BRIGHTNESS%"=="" set "BRIGHTNESS=0.15"

REM Verifica input
if "%INPUT_FILE%"=="" (
    echo Errore: specifica il file video di input
    echo Uso: brighten-video.bat input.mp4 [brightness_value]
    echo Esempio: brighten-video.bat public\videos\farcom-hero.mp4 0.15
    exit /b 1
)

if not exist "%INPUT_FILE%" (
    echo Errore: il file "%INPUT_FILE%" non esiste
    exit /b 1
)

REM Verifica FFmpeg
where ffmpeg >nul 2>&1
if %errorlevel% neq 0 (
    echo Errore: FFmpeg non è installato o non è nel PATH
    echo Installa FFmpeg da: https://ffmpeg.org/download.html
    exit /b 1
)

echo.
echo ========================================
echo Schiarimento video con FFmpeg
echo ========================================
echo File input: %INPUT_FILE%
echo Luminosità: %BRIGHTNESS% (%BRIGHTNESS:~0,3%)
echo ========================================
echo.

REM Crea nome file temporaneo
set "TEMP_FILE=%~dpn1-temp%~x1"

REM Applica filtro luminosità
ffmpeg -i "%INPUT_FILE%" -vf "eq=brightness=%BRIGHTNESS%" -c:v libx264 -c:a copy "%TEMP_FILE%" -y

if %errorlevel% neq 0 (
    echo.
    echo Errore durante l'elaborazione del video
    exit /b 1
)

REM Sostituisci file originale
echo.
echo Sostituzione file originale...
move /Y "%TEMP_FILE%" "%INPUT_FILE%"

if %errorlevel% neq 0 (
    echo Errore durante la sostituzione del file
    exit /b 1
)

echo.
echo ========================================
echo Completato con successo!
echo ========================================
echo File: %INPUT_FILE%
echo Luminosità aumentata di: %BRIGHTNESS:~0,3%
echo ========================================
echo.

endlocal

@echo off
REM ===================================================================
REM   Video Hero FARMCOM — RICODIFICA N.2 (MIGLIOR QUALITÀ × STESSA DIMENSIONE)
REM   Formato: WebM · Codec: VP9 · 1920x1080
REM   Google Chrome / Edge / Firefox / Safari >16 supportano WebM
REM   Mettilo COME PRIMA sorgente nel <source>, usa H264 come fallback.
REM   Stessa qualità di H264 ma ~30-50% di peso in MENO.
REM   Output: public/videos/farcom-hero-vp9.webm   (~4-9 MB)
REM   ATTENZIONE: VP9 è LENTO (~3-8 minuti per 4s su CPU moderno).
REM ===================================================================
chcp 65001 >nul
cd /d "%~dp0"
if not exist ffmpeg.exe (
  echo.
  echo   !!! ffmpeg.exe NON TROVATO !!! Leggi in RECODE-1.cmd
  pause
  exit /b 2
)
set SRC=C:\Users\Acer\Desktop\farcom.mp4
if not exist "%SRC%" set SRC=public\videos\farcom-hero.mp4
set OUT=public\videos\farcom-hero-vp9.webm
del /q "%OUT%" 2>nul

echo.
echo   SRC: %SRC%
echo   OUT: %OUT%
echo   LENTO ~3-8 min... NON chiudere la finestra.
echo.

ffmpeg.exe -y -i "%SRC%" ^
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,unsharp=3:3:0.8:3:3:0.25" ^
  -c:v libvpx-vp9 ^
  -deadline good ^
  -cpu-used 2 ^
  -row-mt 1 ^
  -tile-columns 2 ^
  -crf 31 ^
  -b:v 0 ^
  -g 240 ^
  -pix_fmt yuv420p ^
  -an ^
  "%OUT%"

set EX=%ERRORLEVEL%
echo.
if %EX% EQU 0 (
  for %%A in ("%OUT%") do echo   +++ Fatto VP9 WebM: %%~nxA   %%~zA bytes   [%EX%]
) else (
  echo   !!! FALLITO exit=%EX%
)
echo.
pause

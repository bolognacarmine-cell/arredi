@echo off
REM ===================================================================
REM   Video Hero FARMCOM — RICODIFICA N.1 (FAST, QUALITÀ ALTA)
REM   Formato: MP4 · Codec: H.264 (libx264) · yuv420p · 1920x1080
REM   Upscaling da 640x640 → 1920x1080 (bilineare + sharpen)
REM   Output: public/videos/farcom-hero-hq.mp4   (~6-12 MB)
REM   Compatibilità: TUTTI i browser (2010+) — FALLBACK SICURO
REM ===================================================================
chcp 65001 >nul
cd /d "%~dp0"
if not exist ffmpeg.exe (
  echo.
  echo   !!! ffmpeg.exe NON TROVATO nella cartella del progetto !!!
  echo   Installa FFmpeg:  https://www.gyan.dev/ffmpeg/builds/
  echo   (prendi la "release essentials" e copia solo bin/ffmpeg.exe qua)
  echo.
  pause
  exit /b 2
)

set SRC=C:\Users\Acer\Desktop\farcom.mp4
if not exist "%SRC%" set SRC=public\videos\farcom-hero.mp4

set OUT=public\videos\farcom-hero-hq.mp4
del /q "%OUT%" 2>nul

echo.
echo   SRC: %SRC%
echo   OUT: %OUT%
echo   ~20 secondi per video 4s su CPU moderno...
echo.

REM ----- HQ H264 + upscaling 640x640 → 1920x1080 (letterboxing barrette nere laterali)
ffmpeg.exe -y -i "%SRC%" ^
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,unsharp=3:3:0.9:3:3:0.3" ^
  -c:v libx264 ^
  -preset slow ^
  -profile:v high ^
  -level 4.0 ^
  -pix_fmt yuv420p ^
  -crf 20 ^
  -maxrate 8M ^
  -bufsize 16M ^
  -x264-params "ref=4:bframes=6:me=umh:merange=24:subme=9:psy-rd=1.0,0.2" ^
  -movflags +faststart ^
  -an ^
  "%OUT%"

set EX=%ERRORLEVEL%
echo.
if %EX% EQU 0 (
  for %%A in ("%OUT%") do echo   +++ Fatto HQ H264: %%~nxA   %%~zA bytes   [%EX%]
  echo.
  echo   Ora puoi sostituire farcom-hero.mp4 con questo:
  echo   copy /Y "%OUT%" public\videos\farcom-hero.mp4
) else (
  echo   !!! FALLITO exit=%EX%
)
echo.
pause

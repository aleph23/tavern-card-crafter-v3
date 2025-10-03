@echo off
echo Building Tavern Card Crafter Portable Version...

REM ensures that the latest web version is built
echo Building web version...
call npm run build

REM Create a portable directory
if exist "portable-build" rmdir /s /q "portable-build"
mkdir "portable-build"
mkdir "portable-build\Tavern-Card-Crafter"

REM Copy the necessary files
echo Copying files...
xcopy "dist" "portable-build\Tavern-Card-Crafter\dist" /E /I /Y
xcopy "electron" "portable-build\Tavern-Card-Crafter\electron" /E /I /Y
xcopy "public" "portable-build\Tavern-Card-Crafter\public" /E /I /Y
copy "package.json" "portable-build\Tavern-Card-Crafter\"

REM Create a startup script
echo @echo off > "portable-build\Tavern-Card-Crafter\start.bat"
echo echo Starting Tavern Card Crafter... >> "portable-build\Tavern-Card-Crafter\start.bat"
echo set NODE_ENV=production >> "portable-build\Tavern-Card-Crafter\start.bat"
echo npx electron . >> "portable-build\Tavern-Card-Crafter\start.bat"
echo pause >> "portable-build\Tavern-Card-Crafter\start.bat"

REM Create a description file
echo Tavern Card Crafter - Portable Version > "portable-build\Tavern-Card-Crafter\README.txt"
echo. >> "portable-build\Tavern-Card-Crafter\README.txt"
echo Instructions for use: >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 1. Make sure it is installed Node.js (Version 18 Or higher) >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 2. double click start.bat Start the application >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 3. The dependencies will be automatically installed for the first time, please be patient >> "portable-build\Tavern-Card-Crafter\README.txt"
echo. >> "portable-build\Tavern-Card-Crafter\README.txt"
echo If you encounter problems, run it in the project directory: >> "portable-build\Tavern-Card-Crafter\README.txt"
echo npm install >> "portable-build\Tavern-Card-Crafter\README.txt"
echo npm run electron >> "portable-build\Tavern-Card-Crafter\README.txt"

echo.
echo Portable build completed!
echo Location: portable-build\Tavern-Card-Crafter\
echo.
echo To run: Double-click start.bat in the portable-build\Tavern-Card-Crafter\ folder
pause

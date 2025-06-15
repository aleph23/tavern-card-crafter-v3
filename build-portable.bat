@echo off
echo Building Tavern Card Crafter Portable Version...

REM 确保构建了最新的 Web 版本
echo Building web version...
call npm run build

REM 创建便携版目录
if exist "portable-build" rmdir /s /q "portable-build"
mkdir "portable-build"
mkdir "portable-build\Tavern-Card-Crafter"

REM 复制必要文件
echo Copying files...
xcopy "dist" "portable-build\Tavern-Card-Crafter\dist" /E /I /Y
xcopy "electron" "portable-build\Tavern-Card-Crafter\electron" /E /I /Y
xcopy "public" "portable-build\Tavern-Card-Crafter\public" /E /I /Y
copy "package.json" "portable-build\Tavern-Card-Crafter\"

REM 创建启动脚本
echo @echo off > "portable-build\Tavern-Card-Crafter\start.bat"
echo echo Starting Tavern Card Crafter... >> "portable-build\Tavern-Card-Crafter\start.bat"
echo set NODE_ENV=production >> "portable-build\Tavern-Card-Crafter\start.bat"
echo npx electron . >> "portable-build\Tavern-Card-Crafter\start.bat"
echo pause >> "portable-build\Tavern-Card-Crafter\start.bat"

REM 创建说明文件
echo Tavern Card Crafter - Portable Version > "portable-build\Tavern-Card-Crafter\README.txt"
echo. >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 使用说明： >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 1. 确保已安装 Node.js (版本 18 或更高) >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 2. 双击 start.bat 启动应用 >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 3. 首次运行会自动安装依赖，请耐心等待 >> "portable-build\Tavern-Card-Crafter\README.txt"
echo. >> "portable-build\Tavern-Card-Crafter\README.txt"
echo 如果遇到问题，请在项目目录中运行： >> "portable-build\Tavern-Card-Crafter\README.txt"
echo npm install >> "portable-build\Tavern-Card-Crafter\README.txt"
echo npm run electron >> "portable-build\Tavern-Card-Crafter\README.txt"

echo.
echo Portable build completed!
echo Location: portable-build\Tavern-Card-Crafter\
echo.
echo To run: Double-click start.bat in the portable-build\Tavern-Card-Crafter\ folder
pause

@echo off
echo Batch Script to take input.
set /p input= Type any input
echo Input is: %input%
pause
git add .
git commit -m %input%
git push -u asimappsoumya
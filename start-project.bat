@echo off

cd python

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Checking Python dependencies...
pip install -r requirements.txt

cd ..

echo Checking Node dependencies...
call npm install

echo Starting application...
call npm run dev

pause
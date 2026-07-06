@echo off

:: ===========================
:: Setup Python
:: ===========================

cd python

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Checking Python dependencies...
pip install -r requirements.txt

cd ..

:: ===========================
:: Setup Node.js
:: ===========================

echo Checking Node dependencies...
npm install

:: ===========================
:: Start Application
:: ===========================

npm run dev
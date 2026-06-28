# Email Finder - Setup Guide

## Step 1: Install Python

Install **Python 3.11** or newer.

Verify your installation:

```bash
python --version
```

---

## Step 2: Create the Project

```bash
mkdir email-finder
cd email-finder
```

---

## Step 3: Create a Virtual Environment

### Windows

Create the virtual environment:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### macOS / Linux

Create the virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

---

## Step 4: Install Dependencies

Create a file named **requirements.txt** and add the following packages:

```txt
requests
beautifulsoup4
lxml
pandas
tldextract
tqdm
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

---

## Step 5: Create the Input File

Create a file named **input.txt** and add one website per line:

```txt
google.com
github.com
openai.com
wordpress.org
```

---

## You're Ready!

Your project structure should now look like this:

```
email-finder/
│── venv/
│── requirements.txt
│── input.txt
└── app.py
```
# server.py

import sys
import os
from pathlib import Path

# Determine the base directory (root of the project)
BASE_DIR = Path(__file__).resolve().parent

# Add the base directory to PYTHONPATH
sys.path.insert(0, str(BASE_DIR))

# Set the Django settings module environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

# Import the WSGI application
from project.wsgi import application

# Assign the WSGI application to 'app' for Vercel
app = application

import os
from .profile_db import DATABASE_PATH
from .init_profile_db import init_db

def ensure_db_exists():
    if not os.path.exists(DATABASE_PATH):
        init_db() 
import os
from .profile_db import PROFILE_DB_PATH
from .init_profile_db import init_db

def ensure_db_exists():
    if not os.path.exists(PROFILE_DB_PATH):
        init_db() 
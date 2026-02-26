import os
from dotenv import load_dotenv
from typing import Dict

def load_environment_config() -> Dict[str, str]:
    """
    Determines the current execution environment (local, sit, uat)
    and loads the corresponding .env configuration file securely.
    """
    
    # 1. Determine environment. If not provided, default safely to 'local'
    app_env = os.getenv("APP_ENV", "local").lower()
    
    # 2. Select the correct environment file path
    env_file = f".env.{app_env}"
    
    # 3. Load the specific .env variables into os environment mapping
    load_dotenv(env_file)
    
    return {
        "APP_ENV": app_env,
        "DATABASE_URL": os.getenv("DATABASE_URL", "sqlite:///./expense_tracker_local.db"),
        "API_KEY": os.getenv("API_KEY", "my_local_secret")
    }

# Execute on initialization to expose config globally
settings = load_environment_config()

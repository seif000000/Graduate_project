import os

models_dir = r"d:\seif\graduate_project\backend\app\models"

def fix_file(filename):
    filepath = os.path.join(models_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "datetime.utcnow" in content:
        content = content.replace("datetime.utcnow", "lambda: datetime.now(timezone.utc)")
        if "from datetime import datetime" in content and "timezone" not in content:
            content = content.replace("from datetime import datetime", "from datetime import datetime, timezone")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filename in os.listdir(models_dir):
    if filename.endswith(".py"):
        fix_file(filename)

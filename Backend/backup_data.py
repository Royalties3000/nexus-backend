import sqlite3
import json

def backup():
    try:
        # POINTING TO YOUR DATABASE
        conn = sqlite3.connect('maintenance.db') 
        cursor = conn.cursor()
        
        # Export Assets
        cursor.execute("SELECT * FROM assets")
        asset_cols = [d[0] for d in cursor.description]
        assets = [dict(zip(asset_cols, row)) for row in cursor.fetchall()]
        
        # Export Engineers
        cursor.execute("SELECT * FROM engineers")
        eng_cols = [d[0] for d in cursor.description]
        engineers = [dict(zip(eng_cols, row)) for row in cursor.fetchall()]

        with open('maintenance_backup.json', 'w') as f:
            json.dump({"assets": assets, "engineers": engineers}, f, indent=4)
        
        print(f"✅ Data successfully extracted from maintenance.db")
        print(f"📦 {len(assets)} Assets and {len(engineers)} Engineers saved to maintenance_backup.json")
        conn.close()
    except Exception as e:
        print(f"❌ Backup failed: {e}")

if __name__ == "__main__":
    backup()
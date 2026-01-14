import sqlite3
import os

# This looks for your specific database file
db_path = os.path.join(os.path.dirname(__file__), 'maintenance.db')

def repair():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        print(f"Checking database at: {db_path}")
        cursor.execute("ALTER TABLE maintenance_orders ADD COLUMN end_time DATETIME;")
        conn.commit()
        print("✅ Success! 'end_time' column added.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("ℹ️ Column already exists.")
        else:
            print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    repair()
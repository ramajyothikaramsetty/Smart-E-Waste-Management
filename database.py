import sqlite3

def create_database():
    connection = sqlite3.connect("ewaste.db")

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pickup_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            waste_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            location TEXT NOT NULL,
            pickup_date TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


if __name__ == "__main__":
    create_database()
    print("Database created successfully!")

import mysql.connector
from config import Config
import sys

def update_database():
    conn = None
    cursor = None
    print("Connecting to database...")
    try:
        conn = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        cursor = conn.cursor()
        print("Connected.")

        # 1. Update users table role enum
        print("Updating users table...")
        try:
            cursor.execute("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'kitchen', 'server', 'cleaner') DEFAULT 'customer'")
            print("Users table role updated.")
        except mysql.connector.Error as err:
            print(f"Skipping users update (might already exist): {err}")

        # 2. Update bookings table columns
        print("Updating bookings table...")
        columns_to_add = [
            ("start_time", "TIME"),
            ("end_time", "TIME"),
            ("total_price", "DECIMAL(10, 2) DEFAULT 0.00"),
            ("payment_status", "ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'"),
            ("food_package", "VARCHAR(50)"),
            ("custom_preferences", "TEXT")
        ]
        
        for col_name, col_def in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE bookings ADD COLUMN {col_name} {col_def}")
                print(f"Added column {col_name}")
            except mysql.connector.Error as err:
                if "Duplicate column name" in str(err):
                    print(f"Column {col_name} already exists.")
                else:
                    print(f"Error adding {col_name}: {err}")

        # 3. Create new tables
        print("Creating new tables...")
        
        # Payments
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_method VARCHAR(50) DEFAULT 'credit_card',
                status ENUM('success', 'failed') DEFAULT 'success',
                FOREIGN KEY (booking_id) REFERENCES bookings(id)
            )
            """)
            print("Payments table created/exists.")
        except Exception as e:
            print(f"Error creating payments: {e}")
        
        # Feedback
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                user_id INT NOT NULL,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comments TEXT,
                admin_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """)
            print("Feedback table created/exists.")
        except Exception as e:
            print(f"Error creating feedback: {e}")
        
        # Staff Assignments
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS staff_assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                user_id INT NOT NULL,
                task VARCHAR(255) NOT NULL,
                status ENUM('assigned', 'in_progress', 'completed') DEFAULT 'assigned',
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """)
            print("Staff assignments table created/exists.")
        except Exception as e:
             print(f"Error creating staff_assignments: {e}")

        conn.commit()
        print("Database schema updated successfully!")

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
    except Exception as e:
        print(f"General Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    update_database()

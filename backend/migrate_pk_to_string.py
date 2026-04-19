import sys
import os
import sqlalchemy
sys.path.append(os.getcwd())

from app import create_app, db
from sqlalchemy import text

app = create_app()

def migrate_ids():
    with app.app_context():
        conn = db.engine.connect().execution_options(isolation_level="AUTOCOMMIT")
        try:
            print("START MIGRATE")
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
            
            fks = [
                ('bookings', 'bookings_ibfk_1'),
                ('bookings', 'bookings_ibfk_2'),
                ('feedback', 'feedback_ibfk_1'),
                ('feedback', 'feedback_ibfk_2'),
                ('payments', 'payments_ibfk_1'),
                ('staff_assignments', 'staff_assignments_ibfk_1'),
                ('staff_assignments', 'staff_assignments_ibfk_2')
            ]

            for tbl, fk in fks:
                print(f"DROP {tbl}.{fk}")
                try:
                    conn.execute(text(f"ALTER TABLE {tbl} DROP FOREIGN KEY {fk}"))
                    print("OK")
                except sqlalchemy.exc.OperationalError as e:
                    if "1091" in str(e): # Not exists
                        print("NOT FOUND")
                    else:
                        print(f"ERR: {str(e)[:50]}")
                        # If we can't drop it and it exists, we likely can't proceed?
                        # But maybe it's already dropped.
                except Exception as e:
                     print(f"FAIL: {str(e)[:50]}")

            # MODIFY
            def mod(tbl, col, pre):
                print(f"MOD {tbl}.{col}")
                # Drop AI
                try:
                    conn.execute(text(f"ALTER TABLE {tbl} MODIFY {col} INT"))
                except Exception as e:
                    print(f"AI ERR: {str(e)[:50]}")
                
                # To VARCHAR
                conn.execute(text(f"ALTER TABLE {tbl} MODIFY {col} VARCHAR(20)"))
                # Update
                conn.execute(text(f"UPDATE {tbl} SET {col} = CONCAT('{pre}', LPAD({col}, 2, '0')) WHERE {col} NOT LIKE '{pre}%'"))
                print("MOD OK")

            mod('users', 'id', 'C')
            mod('bookings', 'user_id', 'C') # FK col
            mod('feedback', 'user_id', 'C')
            mod('staff_assignments', 'user_id', 'C')
            
            mod('halls', 'id', 'H')
            mod('bookings', 'hall_id', 'H')
            
            mod('bookings', 'id', 'B')
            mod('payments', 'booking_id', 'B')
            mod('feedback', 'booking_id', 'B')
            mod('staff_assignments', 'booking_id', 'B')

            # RE-ADD
            print("ADD FKs")
            constraints = [
                ("bookings", "bookings_ibfk_1", "FOREIGN KEY (user_id) REFERENCES users(id)"),
                ("bookings", "bookings_ibfk_2", "FOREIGN KEY (hall_id) REFERENCES halls(id)"),
                ("feedback", "feedback_ibfk_1", "FOREIGN KEY (booking_id) REFERENCES bookings(id)"),
                ("feedback", "feedback_ibfk_2", "FOREIGN KEY (user_id) REFERENCES users(id)"),
                ("payments", "payments_ibfk_1", "FOREIGN KEY (booking_id) REFERENCES bookings(id)"),
                ("staff_assignments", "staff_assignments_ibfk_1", "FOREIGN KEY (booking_id) REFERENCES bookings(id)"),
                ("staff_assignments", "staff_assignments_ibfk_2", "FOREIGN KEY (user_id) REFERENCES users(id)")
            ]
            for tbl, name, dfn in constraints:
                try:
                    conn.execute(text(f"ALTER TABLE {tbl} ADD CONSTRAINT {name} {dfn}"))
                    print(f"ADD {name} OK")
                except Exception as e:
                   print(f"ADD {name} ERR: {str(e)[:50]}")

            print("DONE")
        
        except Exception as e:
            print(f"FATAL: {e}")
            import traceback
            traceback.print_exc()
        finally:
            conn.close()

if __name__ == "__main__":
    migrate_ids()

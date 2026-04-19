from app import create_app, db
from sqlalchemy import text, inspect

app = create_app()

def inspect_db():
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        with open('backend/db_inspection_utf8.txt', 'w', encoding='utf-8') as f:
            f.write(f"Tables found: {tables}\n")
            for table in tables:
                f.write(f"\nTable: {table}\n")
                columns = inspector.get_columns(table)
                for col in columns:
                    f.write(f"  - {col['name']} ({col['type']})\n")
                
                fks = inspector.get_foreign_keys(table)
                if fks:
                    f.write("  Foreign Keys:\n")
                    for fk in fks:
                        f.write(f"    - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}\n")
                else:
                    f.write("  No Foreign Keys\n")

if __name__ == "__main__":
    inspect_db()

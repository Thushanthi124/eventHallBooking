from app import create_app, db
from sqlalchemy import text

app = create_app()

def list_fks():
    with app.app_context():
        query = text("""
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL;
        """)
        
        results = db.session.execute(query).fetchall()
        with open('backend/fks_out.txt', 'w', encoding='utf-8') as f:
            for r in results:
                f.write(f"Table: {r[0]}, Column: {r[1]}, Constraint: {r[2]}, Refs: {r[3]}.{r[4]}\n")

if __name__ == "__main__":
    list_fks()

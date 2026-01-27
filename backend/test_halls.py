import traceback
from app import create_app
from app.models import Hall

app = create_app()
with app.app_context():
    try:
        halls = Hall.query.all()
        print(f"Successfully fetched {len(halls)} halls")
        for h in halls:
            print(h.to_dict())
    except Exception as e:
        print("ERROR FETCHING HALLS:")
        traceback.print_exc()

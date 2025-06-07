import requests
from nextplay_db import get_all_games
import psycopg

RAWG_API_KEY = "d69d7316088f478195ad965a35beaf36"  # <-- Replace with your RAWG API key

DB_PARAMS = dict(
    dbname="nextplay_db",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)

def fetch_game_cover(title):
    url = "https://api.rawg.io/api/games"
    params = {
        "key": RAWG_API_KEY,
        "search": title,
        "page_size": 1
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get("results"):
            return data["results"][0].get("background_image")
    except Exception as e:
        print(f"Error fetching cover for '{title}': {e}")
    return None

def update_game_cover_in_db(game_id, cover_url):
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE games SET cover_url = %s WHERE game_id = %s;",
                (cover_url, game_id)
            )
            conn.commit()

def import_all_game_covers():
    games = get_all_games()
    for game in games:
        game_id = game["game_id"]   # Adjust if your PK is named differently
        title = game["name"]       # Adjust if the column name is different
        print(f"Fetching cover for: {title}")
        cover_url = fetch_game_cover(title)
        if cover_url:
            print(f" -> Found cover: {cover_url}")
            update_game_cover_in_db(game_id, cover_url)
        else:
            print(" -> No cover found.")

if __name__ == "__main__":
    import_all_game_covers()

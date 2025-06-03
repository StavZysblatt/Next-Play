import psycopg
from psycopg.rows import dict_row

DB_PARAMS = dict(
    dbname="nextplay_db",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)

def add_or_update_rating(user_id, game_id, rating):
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            # Check if the rating already exists
            cur.execute(
                "SELECT rating_id FROM ratings WHERE user_id = %s AND game_id = %s;",
                (user_id, game_id)
            )
            result = cur.fetchone()
            if result:
                # Update
                cur.execute(
                    "UPDATE ratings SET rating = %s WHERE rating_id = %s;",
                    (rating, result[0])
                )
            else:
                # Insert new
                cur.execute(
                    "INSERT INTO ratings (user_id, game_id, rating) VALUES (%s, %s, %s);",
                    (user_id, game_id, rating)
                )
            conn.commit()

def get_all_games():
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM games")
            return cur.fetchall()

def get_all_users():
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM users")
            return cur.fetchall()

def get_all_ratings():
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM ratings")
            return cur.fetchall()

def get_next_user_id():
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1")
            row = cur.fetchone()
            if row is None or row[0] is None:
                return "u1"
            # Extract the numeric part and increment
            last_id = row[0]
            if last_id.startswith('u'):
                num = int(last_id[1:])
            else:
                num = int(last_id)
            return f"u{num + 1}"

def add_user(name):
    user_id = get_next_user_id()
    with psycopg.connect(**DB_PARAMS) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (user_id, name) VALUES (%s, %s);",
                (user_id, name)
            )
            conn.commit()
    return user_id


# Example usage:
if __name__ == "__main__":
    print(get_all_games()[:2])
    print(get_all_users()[:2])
    print(get_all_ratings()[:2])

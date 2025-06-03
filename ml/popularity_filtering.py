import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from backend.nextplay_db import get_all_games, get_all_ratings
import psycopg

games_df = pd.DataFrame(get_all_games())
popularity_lookup = games_df.set_index('game_id')['popularity_score'].to_dict()

def calculate_and_update_popularity_scores():
    conn = psycopg.connect(
        dbname="nextplay_db",
        user="postgres",
        password="password",
        host="localhost",
        port="5432"
    )
    games = pd.DataFrame(get_all_games())
    games['added'] = games['added'].fillna(0)
    games['rating_count'] = games['rating_count'].fillna(0)
    games['avg_rating'] = games['avg_rating'].fillna(0)
    scaler = MinMaxScaler()
    games[['norm_added', 'norm_rating_count', 'norm_avg_rating']] = scaler.fit_transform(
        games[['added', 'rating_count', 'avg_rating']]
    )
    games['popularity_score'] = (
            0.5 * games['norm_added'] +
            0.3 * games['norm_rating_count'] +
            0.2 * games['norm_avg_rating']
    )
    with conn.cursor() as cur:
        for _, row in games.iterrows():
            cur.execute(
                "UPDATE games SET popularity_score = %s WHERE game_id = %s;",
                (float(row['popularity_score']), int(row['game_id']))
            )
        conn.commit()
    conn.close()
    print("✅ Popularity scores updated in the database!")
    print(games[['game_id', 'name', 'popularity_score']].head())


def recommend_popular_games(user_id, top_n=5):
    games = pd.DataFrame(get_all_games())
    ratings = pd.DataFrame(get_all_ratings())
    played = set(ratings[ratings['user_id'] == user_id]['game_id'])
    recs = games[~games['game_id'].isin(played)].sort_values('popularity_score', ascending=False)
    return recs[['name', 'popularity_score']].head(top_n).values.tolist()

def get_popularity_score(game_id):
    return float(popularity_lookup.get(game_id, 0.0))


if __name__ == "__main__":
    # Uncomment the line you want to run!
    # calculate_and_update_popularity_scores()

    # Example for recommendation (after scores are already in DB)
    top_games = recommend_popular_games("u087", top_n=5)
    for name, score in top_games:
        print(f"{name}: {score:.3f}")

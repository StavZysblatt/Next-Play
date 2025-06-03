import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.nextplay_db import get_all_games, get_all_ratings


def get_games_and_vectors():
    games = pd.DataFrame(get_all_games())
    # Combine text fields for content profile
    games['text'] = (
        games['genres'].fillna('') + ' ' +
        games['tags'].fillna('') + ' ' +
        games['description_raw'].fillna('')
    )
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(games['text'])
    cos_sim = cosine_similarity(tfidf_matrix)
    game_id_to_idx = {gid: idx for idx, gid in enumerate(games['game_id'])}
    indices = pd.Series(games.index, index=games['name']).drop_duplicates()
    return games, cos_sim, game_id_to_idx, indices

# === Recommend similar games (simple function)
def get_similar_games(game_title, top_n=5):
    if game_title not in indices:
        return []
    idx = indices[game_title]
    sim_scores = list(enumerate(cos_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]
    game_indices = [i[0] for i in sim_scores]
    return games['name'].iloc[game_indices].tolist()


def recommend_games_for_user(user_id, top_n=5, like_threshold=3.0):
    games, cos_sim, _, _ = get_games_and_vectors()
    ratings = pd.DataFrame(get_all_ratings())
    games_rated = ratings[ratings['user_id'] == user_id]
    liked_games = games_rated[games_rated['rating'] >= like_threshold]['game_id'].tolist()
    already_played = set(games_rated['game_id'])

    if not liked_games:
        return []

    candidate_indices = [i for i, row in games.iterrows() if row['game_id'] not in already_played]
    scores = []
    for idx in candidate_indices:
        sim = cos_sim[idx, [games[games['game_id'] == gid].index[0] for gid in liked_games if gid in games['game_id'].values]]
        score = sim.mean() if len(sim) > 0 else 0
        scores.append((games.iloc[idx]['name'], score))

    top_games = sorted(scores, key=lambda x: x[1], reverse=True)[:top_n]
    return top_games


def compute_content_score(user_id, game_id, ratings, game_id_to_idx, cos_sim, like_threshold=3.0):
    games_rated = ratings[ratings['user_id'] == user_id]
    liked_games = games_rated[games_rated['rating'] >= like_threshold]['game_id'].tolist()

    if not liked_games or game_id in liked_games:
        return 0.0

    try:
        candidate_idx = game_id_to_idx[game_id]
        liked_indices = [game_id_to_idx[gid] for gid in liked_games if gid in game_id_to_idx]
    except KeyError:
        return 0.0

    sim = cos_sim[candidate_idx, liked_indices]
    return float(sim.mean()) if len(sim) > 0 else 0.0

# === Example usage
if __name__ == "__main__":
    print(get_similar_games("The Witcher 3: Wild Hunt", top_n=5))
    print(recommend_games_for_user("u001", top_n=5))
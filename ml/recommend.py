import pandas as pd
import joblib
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ml.content_based_filtering import compute_content_score
from ml.collaborative_filtering import compute_collab_score
from ml.popularity_filtering import get_popularity_score
from backend.nextplay_db import get_all_games, get_all_ratings

def recommend_hybrid(user_id, top_n=5):
    # Load models
    model = joblib.load("data/hybrid_logistic_model.pkl")
    scaler = joblib.load("data/hybrid_scaler.pkl")

    # Load data ONCE
    games = pd.DataFrame(get_all_games())
    ratings = pd.DataFrame(get_all_ratings())
    played = set(ratings[ratings['user_id'] == user_id]['game_id'])
    candidates = games[~games['game_id'].isin(played)]

    # Precompute matrices
    # Collaborative filtering
    user_item = ratings.pivot_table(index='user_id', columns='game_id', values='rating', fill_value=0)
    svd = TruncatedSVD(n_components=15, random_state=42)

    # Content-based filtering
    games['text'] = (
        games['genres'].fillna('') + ' ' +
        games['tags'].fillna('') + ' ' +
        games['description_raw'].fillna('')
    )
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(games['text'])
    cos_sim = cosine_similarity(tfidf_matrix)
    game_id_to_idx = {gid: idx for idx, gid in enumerate(games['game_id'])}

    # Compute scores for each candidate
    features = []
    for _, row in candidates.iterrows():
        gid = row['game_id']
        cbf = compute_content_score(user_id, gid, ratings, game_id_to_idx, cos_sim)
        cf = compute_collab_score(user_id, gid, user_item, svd)
        pop = get_popularity_score(gid)
        features.append((gid, cbf, cf, pop))

    features_df = pd.DataFrame(features, columns=['game_id', 'content_score', 'collab_score', 'popularity_score'])
    X = scaler.transform(features_df[['content_score', 'collab_score', 'popularity_score']])

    # Predict "like" probabilities
    probas = model.predict_proba(X)[:, 1]
    features_df['like_prob'] = probas

    # Merge with games info and return top N
    results = candidates.merge(features_df, on='game_id').sort_values('like_prob', ascending=False)
    return results[['name', 'like_prob']].head(top_n)

# Example usage:
if __name__ == "__main__":
    recs = recommend_hybrid("u091", top_n=5)
    for idx, row in recs.iterrows():
        print(f"{row['name']}: {row['like_prob']:.3f}")

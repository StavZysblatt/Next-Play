import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from backend.nextplay_db import get_all_ratings, get_all_games



def recommend_games_for_user(user_id, top_n=5):
    # Always load fresh data from DB!
    ratings = pd.DataFrame(get_all_ratings())
    games = pd.DataFrame(get_all_games())
    user_item = ratings.pivot_table(index='user_id', columns='game_id', values='rating', fill_value=0)

    if user_id not in user_item.index:
        return []

    svd = TruncatedSVD(n_components=15, random_state=42)
    user_matrix = svd.fit_transform(user_item)
    user_sim = cosine_similarity(user_matrix)
    user_ids = user_item.index.tolist()

    idx = user_ids.index(user_id)
    sim_scores = list(enumerate(user_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    similar_users = [user_ids[i] for i, _ in sim_scores[1:6]]
    user_games = set(ratings[ratings['user_id'] == user_id]['game_id'])
    candidates = ratings[
        (ratings['user_id'].isin(similar_users)) &
        (~ratings['game_id'].isin(user_games)) &
        (ratings['rating'] >= 4.0)
    ]['game_id'].value_counts().head(top_n).index.tolist()
    return games[games['game_id'].isin(candidates)]['name'].tolist()

def compute_collab_score(user_id, game_id, user_item_matrix, svd_model):
    # Check if user and game exist
    if (user_id not in user_item_matrix.index) or (game_id not in user_item_matrix.columns):
        return 0.0

    orig_rating = user_item_matrix.loc[user_id, game_id]
    user_item_matrix.loc[user_id, game_id] = 0

    user_matrix = svd_model.fit_transform(user_item_matrix)
    user_idx = user_item_matrix.index.get_loc(user_id)
    game_idx = user_item_matrix.columns.get_loc(game_id)
    pred_score = user_matrix[user_idx, :].dot(svd_model.components_[:, game_idx])

    user_item_matrix.loc[user_id, game_id] = orig_rating
    return float(pred_score)



# === Example usage
if __name__ == "__main__":
    print(recommend_games_for_user("u001", top_n=5))

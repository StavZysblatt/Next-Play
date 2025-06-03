import pandas as pd
from backend.nextplay_db import get_all_ratings, get_all_games
from ml.content_based_filtering import compute_content_score
from ml.collaborative_filtering import compute_collab_score, user_item, svd
from ml.popularity_filtering import get_popularity_score

# Load all ratings (user_id, game_id, rating)
ratings = pd.DataFrame(get_all_ratings())

training_rows = []
user_item_matrix = user_item.copy()

for _, row in ratings.iterrows():
    user_id = row['user_id']
    game_id = row['game_id']
    rating = row['rating']

    # 1. Content-based score
    content_score = compute_content_score(user_id, game_id)
    # 2. Collaborative filtering score
    collab_score = compute_collab_score(user_id, game_id, user_item_matrix, svd)
    # 3. Popularity score
    popularity_score = get_popularity_score(game_id)
    # 4. Label (did the user like it?)
    liked = 1 if rating >= 3.0 else 0

    training_rows.append({
        "user_id": user_id,
        "game_id": game_id,
        "content_score": content_score,
        "collab_score": collab_score,
        "popularity_score": popularity_score,
        "liked": liked
    })

training_df = pd.DataFrame(training_rows)
training_df.to_csv("../data/training_dataset.csv", index=False)
print("✅ Training dataset saved! Preview:")
print(training_df.head())

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report
import joblib

# 1. Load your dataset
df = pd.read_csv("../data/training_dataset.csv")

# 2. Prepare features and label
X = df[['content_score', 'collab_score', 'popularity_score']]
y = df['liked']

# 3. Scale the features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# 4. Split for quick evaluation
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 5. Train logistic regression
model = LogisticRegression()
model.fit(X_train, y_train)

# 6. Evaluate (optional, but useful)
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# 7. Save model and scaler
joblib.dump(model, "../data/hybrid_logistic_model.pkl")
joblib.dump(scaler, "../data/hybrid_scaler.pkl")

print("✅ Hybrid model and scaler saved.")


def recommend_hybrid(user_id, top_n=5):
    # Load models
    model = joblib.load("data/hybrid_logistic_model.pkl")
    scaler = joblib.load("data/hybrid_scaler.pkl")

    # Load data
    games = pd.DataFrame(get_all_games())
    ratings = pd.DataFrame(get_all_ratings())
    played = set(ratings[ratings['user_id'] == user_id]['game_id'])

    # Prepare candidate games (not yet rated)
    candidates = games[~games['game_id'].isin(played)]

    # Compute scores for each candidate
    features = []
    for _, row in candidates.iterrows():
        gid = row['game_id']
        cbf = compute_content_score(user_id, gid)
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
    recs = recommend_hybrid("u001", top_n=5)
    for idx, row in recs.iterrows():
        print(f"{row['name']}: {row['like_prob']:.3f}")
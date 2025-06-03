from fastapi import FastAPI, Body
from ml.recommend import recommend_hybrid
import pandas as pd
from backend.nextplay_db import get_all_ratings, get_all_games, add_or_update_rating, add_user
from pydantic import BaseModel
app = FastAPI()

@app.get("/recommend/{user_id}")
def recommend(user_id: str, top_n: int = 5):
    results = recommend_hybrid(user_id, top_n=top_n)
    # Convert results DataFrame to list of dicts for JSON response
    return results.to_dict(orient="records")

@app.get("/popular")
def get_popular_games(top_n: int = 5):
    games = pd.DataFrame(get_all_games())
    popular_games = games.sort_values("popularity_score", ascending=False).head(top_n)
    return popular_games[['game_id', 'name', 'popularity_score']].to_dict(orient="records")

@app.get("/user/{user_id}/games")
def get_user_games(user_id: str):
    ratings = pd.DataFrame(get_all_ratings())
    games = pd.DataFrame(get_all_games())
    user_games = ratings[ratings['user_id'] == user_id]
    # Merge with game info
    merged = user_games.merge(games, left_on='game_id', right_on='game_id')
    return merged[['game_id', 'name', 'rating']].to_dict(orient="records")

@app.get("/user/{user_id}/liked")
def get_user_liked_games(user_id: str, like_threshold: float = 3.0):
    ratings = pd.DataFrame(get_all_ratings())
    games = pd.DataFrame(get_all_games())
    liked_games = ratings[(ratings['user_id'] == user_id) & (ratings['rating'] >= like_threshold)]
    merged = liked_games.merge(games, left_on='game_id', right_on='game_id')
    return merged[['game_id', 'name', 'rating']].to_dict(orient="records")

class LikeGameRequest(BaseModel):
    game_id: int
    rating: float = 5

print("Registering POST /user/{user_id}/like")
@app.post("/user/{user_id}/like")
def like_game(user_id: str, req: LikeGameRequest):
    game_id = req.game_id
    rating = req.rating

    add_or_update_rating(user_id, game_id, rating)

    return {"status": "success", "user_id": user_id, "game_id": game_id, "rating": rating}

@app.get("/")
def root():
    return {"message": "Welcome to Next Play"}

class SignupRequest(BaseModel):
    name: str
@app.post("/signup")
def signup(req: SignupRequest):
    user_id = add_user(req.name)
    return {"status": "success", "user_id": user_id, "name": req.name}




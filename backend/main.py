from fastapi import FastAPI, Body
from ml.recommend import recommend_hybrid
import pandas as pd
from backend.nextplay_db import get_all_ratings, get_all_games, add_or_update_rating, add_user
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/cors-test")
def cors_test():
    response = JSONResponse(content={"message": "CORS manual test"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.get("/recommend/{user_id}")
def recommend(user_id: str, top_n: int = 5):
    results = recommend_hybrid(user_id, top_n=top_n)
    all_games = pd.DataFrame(get_all_games())

    # Include description_raw in the merge
    merged = results.merge(
        all_games[['game_id', 'name', 'cover_url', 'genres', 'description_raw']],
        on='name', how='left'
    )
    merged = merged[['game_id', 'name', 'like_prob', 'cover_url', 'genres', 'description_raw']]

    return merged.to_dict(orient="records")

@app.get("/popular")
def get_popular_games(top_n: int = 5):
    games = pd.DataFrame(get_all_games())
    popular_games = games.sort_values("popularity_score", ascending=False).head(top_n)
    return popular_games[['game_id', 'name', 'popularity_score','cover_url', 'genres', 'description_raw']].to_dict(orient="records")

@app.get("/user/{user_id}/games")
def get_user_games(user_id: str):
    ratings = pd.DataFrame(get_all_ratings())
    games = pd.DataFrame(get_all_games())
    user_games = ratings[ratings['user_id'] == user_id]
    # Merge with game info, include description_raw
    merged = user_games.merge(games, left_on='game_id', right_on='game_id')
    return merged[['game_id', 'name', 'rating','cover_url', 'genres', 'description_raw']].to_dict(orient="records")

@app.get("/user/{user_id}/liked")
def get_user_liked_games(user_id: str, like_threshold: float = 3.0):
    ratings = pd.DataFrame(get_all_ratings())
    games = pd.DataFrame(get_all_games())
    liked_games = ratings[(ratings['user_id'] == user_id) & (ratings['rating'] >= like_threshold)]
    merged = liked_games.merge(games, left_on='game_id', right_on='game_id')
    return merged[['game_id', 'name', 'rating','cover_url', 'genres', 'description_raw']].to_dict(orient="records")

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

@app.get("/games")
def get_all_games_endpoint():
    games = pd.DataFrame(get_all_games())
    # Already returns description_raw!
    return games[['game_id', 'name', 'cover_url', 'genres', 'description_raw']].to_dict(orient="records")

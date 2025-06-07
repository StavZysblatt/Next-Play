import requests

API_KEY = "d69d7316088f478195ad965a35beaf36"  # <--- Insert your RAWG API key here

def get_first_rawg_game(game_title):
    url = "https://api.rawg.io/api/games"
    params = {
        "key": API_KEY,
        "search": game_title,
        "page_size": 1  # Only fetch the first result
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()

    if data.get("results"):
        game = data["results"][0]
        name = game.get("name")
        released = game.get("released")
        cover = game.get("background_image")
        print(f"Game: {name} ({released})")
        print(f"Cover URL: {cover}")
        print(f"RAWG ID: {game.get('id')}")
        print(f"Full Data: {game}")  # Print all game data if you want to inspect
        return game
    else:
        print("No results found.")
        return None

# Example usage:
if __name__ == "__main__":
    game_title = input("Enter game title to search: ")
    get_first_rawg_game(game_title)

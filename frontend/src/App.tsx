import { useState } from "react";
import './App.css';


interface Game {
  game_id: string;
  name: string;
  popularity_score?: number;
  rating?: number;
}

export default function App() {
  const [page, setPage] = useState<"home" | "user">("home");

  // --- Popular Games State ---
  const [popular, setPopular] = useState<Game[]>([]);
  const [popLoading, setPopLoading] = useState(false);
  const [popError, setPopError] = useState<string | null>(null);

  // --- User Page State ---
  const [userId, setUserId] = useState("");
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [recommendations, setRecommendations] = useState<Game[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // --- Fetch popular games when opening Home ---
  const fetchPopular = async () => {
    setPopLoading(true);
    setPopError(null);
    try {
      const res = await fetch("http://localhost:8000/popular");
      if (!res.ok) throw new Error("Failed to fetch popular games");
      setPopular(await res.json());
    } catch (err: any) {
      setPopError(err.message);
    } finally {
      setPopLoading(false);
    }
  };

  // --- Fetch user games & recommendations ---
  const fetchUserData = async () => {
    setUserLoading(true);
    setUserError(null);
    setUserGames([]);
    setRecommendations([]);
    try {
      // Fetch games played
      const gamesRes = await fetch(`http://localhost:8000/user/${userId}/games`);
      if (!gamesRes.ok) throw new Error("Failed to fetch user's games");
      setUserGames(await gamesRes.json());

      // Fetch recommendations
      const recRes = await fetch(`http://localhost:8000/recommend/${userId}`);
      if (!recRes.ok) throw new Error("Failed to fetch recommendations");
      setRecommendations(await recRes.json());
    } catch (err: any) {
      setUserError(err.message);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div id="main-container">
      <h1>NextPlay</h1>

      {/* Navigation */}
      <nav>
        <button
          className={`nav-btn${page === "home" ? " active" : ""}`}
          onClick={() => { setPage("home"); fetchPopular(); }}
        >
          Home
        </button>
        <button
          className={`nav-btn${page === "user" ? " active" : ""}`}
          onClick={() => setPage("user")}
        >
          User
        </button>
      </nav>

      {/* Home Page */}
      {page === "home" && (
        <div className="section-card">
          <h2>Popular Games</h2>
          {popLoading && <p>Loading...</p>}
          {popError && <div className="error">{popError}</div>}
          <ul>
            {popular.map((game) => (
              <li key={game.game_id}>
                <strong>{game.name}</strong> (ID: {game.game_id})
                {game.popularity_score && <> - Popularity: {game.popularity_score.toFixed(2)}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User Page */}
      {page === "user" && (
        <div className="section-card">
          <h2>User Page</h2>
          <input
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="Enter User ID (e.g. u001)"
            type="text"
          />
          <button onClick={fetchUserData}>
            Load User Data
          </button>
          {userLoading && <p>Loading...</p>}
          {userError && <div className="error">{userError}</div>}

<div className="row-section">
  <div className="half-card">
    <h3>Games Played</h3>
    <ul>
      {userGames.map(game => (
        <li key={game.game_id}>
          <strong>{game.name}</strong>
          {game.rating && <> (Rated: {game.rating})</>}
        </li>
      ))}
    </ul>
  </div>
  <div className="half-card">
    <h3>Recommendations</h3>
    <ul>
      {recommendations.map(game => (
        <li key={game.game_id}>
          <strong>{game.name}</strong>
          {game.popularity_score && <> (Popularity: {game.popularity_score.toFixed(2)})</>}
        </li>
      ))}
    </ul>
  </div>
</div>

        </div>
      )}
    </div>
  );
}

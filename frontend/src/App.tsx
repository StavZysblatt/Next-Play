import { useState } from "react";
import './App.css';

interface Game {
  game_id: string;
  name: string;
  popularity_score?: number;
  rating?: number;
  cover_url?: string;
  genres?: string;
  description_raw?: string;
}

// Overlay card (centered popup)
function GameCardOverlay({
  game,
  onClose,
  showRating = false
}: {
  game: Game;
  onClose: () => void;
  showRating?: boolean;
}) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const desc = game.description_raw || "";
  const shouldTruncate = desc.length > 200 && !showFullDesc;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="game-card overlay-card expanded" onClick={e => e.stopPropagation()}>
        <div className="game-card-thumb">
          {game.cover_url && (
            <img
              src={game.cover_url}
              alt={game.name}
              className="game-card-img"
              style={{
                width: '160px',
                height: '160px',
              }}
            />
          )}
        </div>
        <div className="game-card-info">
          <div className="game-card-title" style={{ fontSize: "1.26rem" }}>{game.name}</div>
          <div className="game-card-genres">{game.genres || "No genres"}</div>
          <div className="game-card-desc" style={{ fontSize: "1.09em" }}>
            {shouldTruncate ? (
              <>
                {desc.slice(0, 200)}...
                <span
                  className="game-card-more"
                  onClick={e => {
                    e.stopPropagation();
                    setShowFullDesc(true);
                  }}
                >
                  Show more
                </span>
              </>
            ) : (
              desc
            )}
          </div>
          {showRating && typeof game.rating === "number" && (
            <div className="game-card-rating">
              Rated: {game.rating}
            </div>
          )}
          <button className="overlay-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Small grid card (collapsed view)
function GameCard({
  game,
  onClick
}: {
  game: Game;
  onClick: () => void;
}) {
  return (
    <li className="game-card" onClick={onClick}>
      <div className="game-card-thumb">
        {game.cover_url && (
          <img
            src={game.cover_url}
            alt={game.name}
            className="game-card-img"
            style={{
              width: '54px',
              height: '54px',
            }}
          />
        )}
      </div>
      <div className="game-card-info">
        <div className="game-card-title">{game.name}</div>
      </div>
    </li>
  );
}

export default function App() {
  const [page, setPage] = useState<"home" | "user">("home");
  const [expandedCard, setExpandedCard] = useState<Game | null>(null);

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

      {/* Overlay */}
      {expandedCard && (
        <GameCardOverlay
          game={expandedCard}
          onClose={() => setExpandedCard(null)}
          showRating={typeof expandedCard.rating === "number"}
        />
      )}

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
          <ul className="game-list" style={{ filter: expandedCard ? "blur(2px)" : undefined, pointerEvents: expandedCard ? "none" : undefined }}>
            {popular.map((game) => (
              <GameCard
                key={game.game_id}
                game={game}
                onClick={() => setExpandedCard(game)}
              />
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
            {/* Games Played */}
            <div className="half-card">
              <h3>Games Played</h3>
              <ul className="game-list" style={{ filter: expandedCard ? "blur(2px)" : undefined, pointerEvents: expandedCard ? "none" : undefined }}>
                {userGames.map(game => (
                  <GameCard
                    key={game.game_id}
                    game={game}
                    onClick={() => setExpandedCard(game)}
                  />
                ))}
              </ul>
            </div>
            {/* Recommendations */}
            <div className="half-card">
              <h3>Recommendations</h3>
              <ul className="game-list" style={{ filter: expandedCard ? "blur(2px)" : undefined, pointerEvents: expandedCard ? "none" : undefined }}>
                {recommendations.map((game) => (
                  <GameCard
                    key={game.game_id}
                    game={game}
                    onClick={() => setExpandedCard(game)}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

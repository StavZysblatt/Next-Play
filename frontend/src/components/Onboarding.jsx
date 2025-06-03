import { useState, useEffect } from 'react';
import { Search, Heart, Star, CheckCircle } from 'lucide-react';
import GameCard from './GameCard';

const Onboarding = ({ userId, onComplete }) => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [likedGames, setLikedGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Filter games based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = games.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.genres && game.genres.some(genre => 
          genre.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(games);
    }
  }, [games, searchTerm]);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:8000/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
      setFilteredGames(data);
    } catch (err) {
      setError('Failed to load games. Please try again.');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeGame = async (gameId, rating = 4.0) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId, rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to like game');
      }

      // Add to liked games if not already there
      if (!likedGames.includes(gameId)) {
        setLikedGames([...likedGames, gameId]);
      }
    } catch (err) {
      console.error('Error liking game:', err);
      // You might want to show an error message to the user
    }
  };

  const handleCompleteOnboarding = () => {
    if (likedGames.length >= 5) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGames}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pick games you love
          </h1>
          <p className="text-gray-600 mb-4">
            Select at least 5 games to get personalized recommendations
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-lg font-semibold text-gray-900">
              {likedGames.length} / 5 games selected
            </span>
            {likedGames.length >= 5 && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Search games..."
            />
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isLiked={likedGames.includes(game.id)}
              onLike={() => handleLikeGame(game.id)}
              showRating={false}
            />
          ))}
        </div>

        {/* No games found */}
        {filteredGames.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No games found matching your search.</p>
          </div>
        )}

        {/* Complete button */}
        {likedGames.length >= 5 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleCompleteOnboarding}
              className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>See my recommendations</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 
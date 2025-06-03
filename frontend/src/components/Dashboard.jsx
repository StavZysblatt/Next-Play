import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Search, Star } from 'lucide-react';
import GameCard from './GameCard';

const Dashboard = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [popularGames, setPopularGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState({
    recommendations: true,
    popular: true,
    games: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRecommendations();
    fetchPopularGames();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:8000/recommend/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setErrors(prev => ({ ...prev, recommendations: 'Failed to load recommendations' }));
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const fetchPopularGames = async () => {
    try {
      const response = await fetch('http://localhost:8000/popular');
      if (!response.ok) {
        throw new Error('Failed to fetch popular games');
      }
      const data = await response.json();
      setPopularGames(data);
    } catch (err) {
      console.error('Error fetching popular games:', err);
      setErrors(prev => ({ ...prev, popular: 'Failed to load popular games' }));
    } finally {
      setLoading(prev => ({ ...prev, popular: false }));
    }
  };

  const fetchAllGames = async () => {
    if (allGames.length > 0) return; // Already loaded
    
    setLoading(prev => ({ ...prev, games: true }));
    try {
      const response = await fetch('http://localhost:8000/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setAllGames(data);
    } catch (err) {
      console.error('Error fetching games:', err);
      setErrors(prev => ({ ...prev, games: 'Failed to load games' }));
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  };

  const handleRateGame = async (gameId, rating) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId, rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate game');
      }

      // Refresh recommendations after rating
      fetchRecommendations();
    } catch (err) {
      console.error('Error rating game:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'browse') {
      fetchAllGames();
    }
  };

  const filteredGames = allGames.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (game.genres && game.genres.some(genre => 
      genre.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="text-center py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Discover new games tailored just for you
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('recommendations')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>For You</span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('popular')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'popular'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('browse')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Browse</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
              Recommended for You
            </h2>
            
            {loading.recommendations ? (
              <LoadingSpinner />
            ) : errors.recommendations ? (
              <ErrorMessage 
                message={errors.recommendations} 
                onRetry={fetchRecommendations}
              />
            ) : recommendations.length === 0 ? (
              <EmptyState message="No recommendations available. Try rating more games!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onRate={handleRateGame}
                    showRating={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popular Tab */}
        {activeTab === 'popular' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              Popular Games
            </h2>
            
            {loading.popular ? (
              <LoadingSpinner />
            ) : errors.popular ? (
              <ErrorMessage 
                message={errors.popular} 
                onRetry={fetchPopularGames}
              />
            ) : popularGames.length === 0 ? (
              <EmptyState message="No popular games available." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onRate={handleRateGame}
                    showRating={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Search className="w-6 h-6 text-blue-500 mr-2" />
                Browse Games
              </h2>
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
            
            {loading.games ? (
              <LoadingSpinner />
            ) : errors.games ? (
              <ErrorMessage 
                message={errors.games} 
                onRetry={fetchAllGames}
              />
            ) : filteredGames.length === 0 ? (
              <EmptyState 
                message={searchTerm ? "No games found matching your search." : "No games available."} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onRate={handleRateGame}
                    showRating={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
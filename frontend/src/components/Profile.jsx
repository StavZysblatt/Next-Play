import { useState, useEffect } from 'react';
import { Heart, Star, User as UserIcon } from 'lucide-react';
import GameCard from './GameCard';

const Profile = ({ userId }) => {
  const [likedGames, setLikedGames] = useState([]);
  const [allRatedGames, setAllRatedGames] = useState([]);
  const [activeTab, setActiveTab] = useState('liked');
  const [loading, setLoading] = useState({
    liked: true,
    rated: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLikedGames();
  }, [userId]);

  const fetchLikedGames = async () => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}/liked`);
      if (!response.ok) {
        throw new Error('Failed to fetch liked games');
      }
      const data = await response.json();
      setLikedGames(data);
    } catch (err) {
      console.error('Error fetching liked games:', err);
      setErrors(prev => ({ ...prev, liked: 'Failed to load liked games' }));
    } finally {
      setLoading(prev => ({ ...prev, liked: false }));
    }
  };

  const fetchAllRatedGames = async () => {
    if (allRatedGames.length > 0) return; // Already loaded
    
    setLoading(prev => ({ ...prev, rated: true }));
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}/games`);
      if (!response.ok) {
        throw new Error('Failed to fetch rated games');
      }
      const data = await response.json();
      setAllRatedGames(data);
    } catch (err) {
      console.error('Error fetching rated games:', err);
      setErrors(prev => ({ ...prev, rated: 'Failed to load rated games' }));
    } finally {
      setLoading(prev => ({ ...prev, rated: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'rated') {
      fetchAllRatedGames();
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

      // Refresh data after rating
      if (activeTab === 'liked') {
        fetchLikedGames();
      } else {
        fetchAllRatedGames();
      }
    } catch (err) {
      console.error('Error rating game:', err);
    }
  };

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
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Profile
        </h1>
        <p className="text-gray-600">
          Manage your game ratings and preferences
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{likedGames.length}</p>
              <p className="text-gray-600">Liked Games</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allRatedGames.length}</p>
              <p className="text-gray-600">Rated Games</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('liked')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'liked'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Liked Games</span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('rated')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'rated'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>All Ratings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Liked Games Tab */}
        {activeTab === 'liked' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              Games You Love
            </h2>
            
            {loading.liked ? (
              <LoadingSpinner />
            ) : errors.liked ? (
              <ErrorMessage 
                message={errors.liked} 
                onRetry={fetchLikedGames}
              />
            ) : likedGames.length === 0 ? (
              <EmptyState message="You haven't liked any games yet. Start exploring and heart your favorites!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedGames.map((gameData) => (
                  <GameCard
                    key={gameData.game.id}
                    game={gameData.game}
                    isLiked={true}
                    onRate={handleRateGame}
                    showRating={true}
                    userRating={gameData.rating}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Rated Games Tab */}
        {activeTab === 'rated' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              All Your Ratings
            </h2>
            
            {loading.rated ? (
              <LoadingSpinner />
            ) : errors.rated ? (
              <ErrorMessage 
                message={errors.rated} 
                onRetry={fetchAllRatedGames}
              />
            ) : allRatedGames.length === 0 ? (
              <EmptyState message="You haven't rated any games yet. Start rating games to see them here!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allRatedGames.map((gameData) => (
                  <GameCard
                    key={gameData.game.id}
                    game={gameData.game}
                    isLiked={gameData.rating >= 3.0}
                    onRate={handleRateGame}
                    showRating={true}
                    userRating={gameData.rating}
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

export default Profile; 
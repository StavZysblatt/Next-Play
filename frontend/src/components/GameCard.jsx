import { useState } from 'react';
import { Heart, Star } from 'lucide-react';

const GameCard = ({ game, isLiked, onLike, onRate, showRating = true, userRating = null }) => {
  const [rating, setRating] = useState(userRating || 0);
  const [isRating, setIsRating] = useState(false);

  const handleStarClick = (starRating) => {
    setRating(starRating);
    if (onRate) {
      onRate(game.id, starRating);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Game Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-white text-center p-4">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-sm opacity-80">No Image</p>
          </div>
        )}
        
        {/* Like button */}
        <button
          onClick={onLike}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            isLiked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={game.name}>
          {game.name}
        </h3>
        
        {/* Genres */}
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {genre}
              </span>
            ))}
            {game.genres.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{game.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {showRating && (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="transition-colors"
                onMouseEnter={() => setIsRating(true)}
                onMouseLeave={() => setIsRating(false)}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= (isRating ? star : rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {rating}.0
              </span>
            )}
          </div>
        )}

        {/* Release Date */}
        {game.release_date && (
          <p className="text-sm text-gray-500 mt-2">
            Released: {new Date(game.release_date).getFullYear()}
          </p>
        )}

        {/* Average Rating */}
        {game.average_rating && (
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {game.average_rating.toFixed(1)} ({game.rating_count || 0} ratings)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard; 
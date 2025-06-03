# Game Recommendation System - Frontend

A modern React application built with Vite and Tailwind CSS for a game recommendation system.

## Features

### 🎮 User Experience

- **Sign Up Flow**: Simple user registration with name input
- **Onboarding**: Interactive game selection (minimum 5 games) to build user preferences
- **Personalized Recommendations**: AI-powered game suggestions based on user ratings
- **Game Discovery**: Browse popular games and search through the entire game catalog
- **Rating System**: 5-star rating system for games
- **User Profile**: View liked games and rating history

### 🎨 Modern UI/UX

- Responsive design that works on all devices
- Clean, intuitive interface with Tailwind CSS
- Loading spinners and error handling
- Empty state messages for better user guidance
- Smooth transitions and hover effects

### 📱 Navigation

- Tab-based navigation in main dashboard (For You, Popular, Browse)
- Profile page with liked games and rating history
- Logout functionality

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **Bun** - Fast package manager and runtime

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Backend API running on `http://localhost:8000` (see backend documentation)

### Installation

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Start the development server:**

   ```bash
   bun run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` and uses the following endpoints:

- `POST /signup` - User registration
- `POST /user/{user_id}/like` - Rate/like a game
- `GET /user/{user_id}/games` - Get all user's rated games
- `GET /user/{user_id}/liked` - Get user's liked games (rating >= 3.0)
- `GET /recommend/{user_id}` - Get personalized recommendations
- `GET /popular` - Get popular games
- `GET /games` - Get all games

## Project Structure

```
src/
├── components/
│   ├── SignUp.jsx          # User registration component
│   ├── Onboarding.jsx      # Game selection onboarding
│   ├── Dashboard.jsx       # Main dashboard with tabs
│   ├── Profile.jsx         # User profile page
│   ├── Navbar.jsx          # Navigation bar
│   └── GameCard.jsx        # Reusable game card component
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
└── index.css              # Tailwind CSS imports
```

## Components Overview

### SignUp

- Clean signup form with name input
- Error handling and loading states
- Connects to `/signup` endpoint

### Onboarding

- Interactive game selection interface
- Search functionality for games
- Progress tracking (5+ games required)
- Smooth transition to main app

### Dashboard

- Three main tabs: For You, Popular, Browse
- Personalized recommendations
- Popular games discovery
- Full game catalog with search
- Real-time rating functionality

### Profile

- User statistics (liked games, total ratings)
- Two tabs: Liked Games, All Ratings
- Rating management

### GameCard

- Reusable game display component
- Like/heart functionality
- 5-star rating system
- Game information display
- Responsive design

## User Flow

1. **First Visit**: User sees signup screen
2. **Registration**: User enters name and creates account
3. **Onboarding**: User selects 5+ games they like
4. **Main App**: User gets personalized recommendations
5. **Ongoing Use**: User can browse, rate games, and view profile

## Development Features

- Hot module replacement (HMR) with Vite
- ESLint configuration for code quality
- Modern JavaScript/JSX syntax
- Component-based architecture
- Responsive grid layouts

## Environment Configuration

The application is configured to connect to:

- **Backend API**: `http://localhost:8000`
- **Frontend Dev Server**: `http://localhost:5173`

Make sure your backend is running before starting the frontend application.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Contributing

1. Follow the existing code style
2. Use meaningful component names
3. Add proper error handling
4. Test on different screen sizes
5. Ensure backend connectivity works

## License

This project is part of a game recommendation system demo.

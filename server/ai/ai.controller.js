const mongoose = require('mongoose');
const LibraryItem = require('../models/LibraryItem');
const { memoryStore } = require('../utils/inMemoryStore');
const { askGemini } = require('./gemini.service');
const {
  libraryAnalysisPrompt,
  recommendationPrompt,
  searchPrompt,
  descriptionPrompt
} = require('./promptTemplates');

// Helper to get all non-deleted user items from MongoDB or In-Memory Store
async function getUserLibrary(userId) {
  if (mongoose.connection.readyState === 1) {
    return await LibraryItem.find({ createdBy: userId, deleted: false }).lean();
  } else {
    return memoryStore.items.filter(item => item.createdBy === userId && !item.deleted);
  }
}

// Local Fallback Parsers if Gemini API is unreachable or key fails
function fallbackSearchFilter(q) {
  const filter = {};
  const lower = q.toLowerCase();

  if (lower.includes('movie')) filter.type = 'Movie';
  if (lower.includes('book')) filter.type = 'Book';

  const gteMatch = lower.match(/(?:above|greater than|>|at least)\s*(\d)/i);
  if (gteMatch) {
    filter.rating = { $gte: parseInt(gteMatch[1], 10) };
  } else {
    const starMatch = lower.match(/(\d)\s*(?:star|rating)/i);
    if (starMatch) filter.rating = parseInt(starMatch[1], 10);
  }

  if (lower.includes('unfinished') || lower.includes('plan to') || lower.includes('reading') || lower.includes('watching')) {
    filter.status = lower.includes('unfinished') ? 'Plan to Watch' : (lower.includes('reading') || lower.includes('watching') ? 'Watching' : 'Plan to Watch');
  }

  // Genre extraction heuristic
  const knownGenres = ['thriller', 'sci-fi', 'science fiction', 'fantasy', 'self-help', 'action', 'drama', 'comedy', 'romance'];
  for (const g of knownGenres) {
    if (lower.includes(g)) {
      filter.genre = { $regex: g, $options: 'i' };
      break;
    }
  }

  if (!filter.type && !filter.rating && !filter.genre && !filter.status) {
    filter.title = { $regex: q.trim(), $options: 'i' };
  }

  return filter;
}

function fallbackAnalysis(items) {
  const movies = items.filter(i => i.type === 'Movie');
  const books = items.filter(i => i.type === 'Book');
  const genres = [...new Set(items.map(i => i.genre))];

  return {
    summary: `Your library contains ${items.length} item(s) (${movies.length} Movies, ${books.length} Books). Your top logged genres are ${genres.join(', ') || 'diverse'}.`,
    favoriteGenres: genres.slice(0, 3),
    collectionBalance: `${movies.length} Movies vs ${books.length} Books`,
    readingHabit: books.length > 0 ? `Cataloged ${books.length} book(s) with an average rating of ${(books.reduce((a,b)=>a+b.rating,0)/(books.length||1)).toFixed(1)}/5.` : 'No books cataloged yet.',
    watchingHabit: movies.length > 0 ? `Cataloged ${movies.length} movie(s) with an average rating of ${(movies.reduce((a,b)=>a+b.rating,0)/(movies.length||1)).toFixed(1)}/5.` : 'No movies cataloged yet.',
    highestRatedGenre: genres[0] || 'N/A',
    leastExploredGenre: 'Biography / History',
    missingGenres: ['Mystery', 'Biography', 'Documentary'],
    interestingFacts: [
      `You have ${items.filter(i => i.favorite).length} items marked as Favorites.`,
      `Your library spans ${new Set(items.map(i => i.releaseYear)).size} different release years.`,
      `Most rated items fall into the ${genres[0] || 'Drama'} category.`
    ],
    recommendations: [
      { title: 'The Matrix', type: 'Movie', genre: 'Sci-Fi', reason: 'Matches your interest in high-concept cinema.' },
      { title: 'Atomic Habits', type: 'Book', genre: 'Self-Help', reason: 'Complements your reading list.' }
    ]
  };
}

function fallbackRecommendations(items) {
  return {
    movies: [
      { title: 'Blade Runner 2049', type: 'Movie', genre: 'Sci-Fi', reason: 'Fits your library taste in immersive Sci-Fi.', confidence: 95 },
      { title: 'Shutter Island', type: 'Movie', genre: 'Thriller', reason: 'Complements your mystery and thriller ratings.', confidence: 92 },
      { title: 'Inception', type: 'Movie', genre: 'Sci-Fi', reason: 'High rating match based on your preferences.', confidence: 90 },
      { title: 'The Prestige', type: 'Movie', genre: 'Drama', reason: 'Strong match for your favorite directors.', confidence: 88 },
      { title: 'Arrival', type: 'Movie', genre: 'Sci-Fi', reason: 'Critically acclaimed match for your library.', confidence: 86 }
    ],
    books: [
      { title: 'Project Hail Mary', type: 'Book', genre: 'Sci-Fi', reason: 'Top recommended book for your Sci-Fi shelf.', confidence: 94 },
      { title: 'Deep Work', type: 'Book', genre: 'Self-Help', reason: 'Matches your personal growth reading patterns.', confidence: 91 },
      { title: 'Dune Messiah', type: 'Book', genre: 'Sci-Fi', reason: 'Natural continuation for speculative fiction readers.', confidence: 89 },
      { title: 'Thinking, Fast and Slow', type: 'Book', genre: 'Psychology', reason: 'Highly rated match for your library topics.', confidence: 87 },
      { title: 'Sapiens', type: 'Book', genre: 'History', reason: 'Great non-fiction recommendation for your collection.', confidence: 85 }
    ]
  };
}

// Feature 1: Analyze Library
const analyzeLibrary = async (req, res) => {
  try {
    const items = await getUserLibrary(req.user._id);

    if (!items || items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: "Your library is currently empty! Add some movies or books to get personalized AI insights.",
          favoriteGenres: [],
          collectionBalance: "0 Items cataloged",
          readingHabit: "No books recorded yet.",
          watchingHabit: "No movies recorded yet.",
          highestRatedGenre: "N/A",
          leastExploredGenre: "N/A",
          missingGenres: ["Sci-Fi", "Mystery", "Biography", "Fantasy"],
          interestingFacts: ["Start cataloging your items to unlock AI analysis!"],
          recommendations: []
        }
      });
    }

    const librarySnapshot = {
      totalItems: items.length,
      moviesCount: items.filter(i => i.type === 'Movie').length,
      booksCount: items.filter(i => i.type === 'Book').length,
      favorites: items.filter(i => i.favorite).map(i => ({ title: i.title, type: i.type, genre: i.genre, rating: i.rating })),
      items: items.map(i => ({
        title: i.title,
        type: i.type,
        genre: i.genre,
        authorOrDirector: i.authorOrDirector,
        rating: i.rating,
        releaseYear: i.releaseYear,
        status: i.status,
        favorite: i.favorite,
        tags: i.tags
      }))
    };

    let analysis;
    try {
      const prompt = libraryAnalysisPrompt(librarySnapshot);
      analysis = await askGemini(prompt);
    } catch (apiErr) {
      console.warn('[AI Controller] Gemini API unavailable, using fallback analysis:', apiErr.message);
      analysis = fallbackAnalysis(items);
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    console.error('AI Library Analysis Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'AI service error.'
    });
  }
};

// Feature 2: Get Personalized Recommendations
const getRecommendations = async (req, res) => {
  try {
    const items = await getUserLibrary(req.user._id);

    const userSnapshot = {
      favorites: items.filter(i => i.favorite).map(i => ({ title: i.title, type: i.type, genre: i.genre })),
      highRated: items.filter(i => i.rating >= 4).map(i => ({ title: i.title, type: i.type, genre: i.genre, rating: i.rating })),
      allTitles: items.map(i => i.title),
      genres: [...new Set(items.map(i => i.genre))]
    };

    let recommendations;
    try {
      const prompt = recommendationPrompt(userSnapshot);
      recommendations = await askGemini(prompt);
    } catch (apiErr) {
      console.warn('[AI Controller] Gemini API unavailable, using fallback recommendations:', apiErr.message);
      recommendations = fallbackRecommendations(items);
    }

    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error('AI Recommendation Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'AI service error.'
    });
  }
};

// Feature 3: Smart Search
const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const items = await getUserLibrary(req.user._id);
    const sampleFields = {
      genres: [...new Set(items.map(i => i.genre))],
      types: ['Movie', 'Book'],
      statuses: ['Plan to Watch', 'Watching', 'Completed', 'On Hold']
    };

    let mongoQuery;
    try {
      const prompt = searchPrompt(query.trim(), sampleFields);
      mongoQuery = await askGemini(prompt, false);
    } catch (apiErr) {
      console.warn('[AI Controller] Gemini API unavailable, using fallback search filter:', apiErr.message);
      mongoQuery = fallbackSearchFilter(query.trim());
    }

    let matchingItems = [];

    if (mongoose.connection.readyState === 1) {
      const fullQuery = {
        createdBy: req.user._id,
        deleted: false
      };

      for (const [key, value] of Object.entries(mongoQuery)) {
        if (['type', 'genre', 'rating', 'releaseYear', 'status', 'favorite', 'authorOrDirector', 'title', 'tags'].includes(key)) {
          if (typeof value === 'object' && value !== null && value.$regex) {
            fullQuery[key] = new RegExp(value.$regex, value.$options || 'i');
          } else {
            fullQuery[key] = value;
          }
        }
      }

      matchingItems = await LibraryItem.find(fullQuery).lean();
    } else {
      matchingItems = items.filter(item => {
        let matches = true;
        if (mongoQuery.type && item.type.toLowerCase() !== mongoQuery.type.toLowerCase()) matches = false;
        if (mongoQuery.genre) {
          const g = typeof mongoQuery.genre === 'object' ? mongoQuery.genre.$regex : mongoQuery.genre;
          if (g && !new RegExp(g, 'i').test(item.genre)) matches = false;
        }
        if (mongoQuery.rating) {
          if (typeof mongoQuery.rating === 'object') {
            if (mongoQuery.rating.$gte && item.rating < mongoQuery.rating.$gte) matches = false;
            if (mongoQuery.rating.$lte && item.rating > mongoQuery.rating.$lte) matches = false;
          } else if (item.rating !== Number(mongoQuery.rating)) {
            matches = false;
          }
        }
        if (mongoQuery.status && item.status.toLowerCase() !== mongoQuery.status.toLowerCase()) matches = false;
        if (mongoQuery.favorite !== undefined && item.favorite !== mongoQuery.favorite) matches = false;
        return matches;
      });
    }

    return res.status(200).json({
      success: true,
      query,
      mongoFilter: mongoQuery,
      count: matchingItems.length,
      data: matchingItems
    });
  } catch (err) {
    console.error('AI Smart Search Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'AI service error.'
    });
  }
};

// Feature 4: AI Description & Tag Generator
const generateDescription = async (req, res) => {
  try {
    const { title, type } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required to generate AI metadata'
      });
    }

    const itemType = type && ['Movie', 'Book'].includes(type) ? type : 'Movie';
    let metadata;
    try {
      const prompt = descriptionPrompt(title.trim(), itemType);
      metadata = await askGemini(prompt);
    } catch (apiErr) {
      console.warn('[AI Controller] Gemini API unavailable, using fallback generator:', apiErr.message);
      metadata = {
        description: `A compelling ${itemType.toLowerCase()} titled "${title.trim()}" exploring deep themes and engaging storytelling.`,
        genre: itemType === 'Movie' ? 'Sci-Fi' : 'Fiction',
        summary: `An exciting ${itemType.toLowerCase()} experience: ${title.trim()}.`,
        tags: [itemType.toLowerCase(), 'featured', 'popular']
      };
    }

    return res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (err) {
    console.error('AI Generator Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'AI service error.'
    });
  }
};

module.exports = {
  analyzeLibrary,
  getRecommendations,
  smartSearch,
  generateDescription
};

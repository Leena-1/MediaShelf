/**
 * Prompt Templates for MediaShelf AI Features
 * All prompts are pure functions — no hardcoding anywhere else.
 */

// ── Feature 1: Library Analyzer ─────────────────────────────────────────────
function libraryAnalysisPrompt(libraryData) {
  return `
You are an intelligent personal library assistant for MediaShelf, a personal movie and book tracking app.

Analyze the following library data for a user and return a detailed, insightful JSON analysis.
Be specific, personal, and thoughtful. Reference actual titles and genres from the data where possible.

Library Data:
${JSON.stringify(libraryData, null, 2)}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "summary": "2-3 sentence personalized summary of the user's taste and habits",
  "favoriteGenres": ["genre1", "genre2", "genre3"],
  "collectionBalance": "Insight on the ratio of movies vs books (e.g. '70% Movies, 30% Books — you lean cinematic')",
  "readingHabit": "Insight about reading behavior based on book statuses and ratings",
  "watchingHabit": "Insight about watching behavior based on movie statuses and ratings",
  "highestRatedGenre": "The genre with the highest average rating",
  "leastExploredGenre": "A genre that appears underrepresented given their other interests",
  "missingGenres": ["genre1", "genre2"],
  "interestingFacts": [
    "Interesting fact 1 referencing actual data",
    "Interesting fact 2 referencing actual data",
    "Interesting fact 3 referencing actual data"
  ],
  "recommendations": [
    {
      "title": "Title",
      "type": "Movie or Book",
      "genre": "Genre",
      "reason": "Why this fits their taste based on their library"
    }
  ]
}
`;
}

// ── Feature 2: Personalized Recommendations ─────────────────────────────────
function recommendationPrompt(userData) {
  return `
You are an intelligent personal library assistant for MediaShelf.

Based on this user's library data, generate highly personalized recommendations.
Only recommend items NOT already in their library. Be specific and explain why each fits their taste.

User's Library Data:
${JSON.stringify(userData, null, 2)}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "movies": [
    {
      "title": "Movie Title",
      "type": "Movie",
      "genre": "Genre",
      "reason": "Specific reason based on their library (mention actual titles they liked)",
      "confidence": 92
    }
  ],
  "books": [
    {
      "title": "Book Title",
      "type": "Book",
      "genre": "Genre",
      "reason": "Specific reason based on their library",
      "confidence": 88
    }
  ]
}

Rules:
- Return exactly 5 movies and 5 books
- confidence is a number from 70 to 98 (how well it matches their taste)
- Never recommend items already in their library
- Reference specific titles from their library in the reason field
`;
}

// ── Feature 3: AI Smart Search ───────────────────────────────────────────────
function searchPrompt(query, sampleFields) {
  return `
You are a database query expert for a personal movie and book library app called MediaShelf.

Convert the following natural language search query into a MongoDB filter object.
Only use fields that exist in the library item schema.

Available fields:
- type: "Movie" or "Book"
- genre: string (e.g. "Sci-Fi", "Thriller", "Fantasy", "Self-Help")
- rating: number from 1 to 5
- releaseYear: number (e.g. 2020)
- status: "Plan to Watch" | "Watching" | "Completed" | "On Hold"
- favorite: boolean
- authorOrDirector: string
- title: string (use $regex for partial matches)
- tags: array of strings

User Query: "${query}"

Sample genres and values from user's library: ${JSON.stringify(sampleFields)}

Rules:
- NEVER search external sources. Only generate a MongoDB filter JSON.
- For genre, use case-insensitive $regex unless it's an exact match
- For title/authorOrDirector, always use $regex with $options: "i"
- For rating comparisons like "above 4", use { "$gte": 4 }
- Return ONLY valid JSON (no markdown, no explanation)

Example output for "Show thriller movies rated above 4":
{"type":"Movie","genre":{"$regex":"thriller","$options":"i"},"rating":{"$gte":4}}

Now convert this query and return ONLY the JSON filter:
`;
}

// ── Feature 4: Description & Tag Generator ───────────────────────────────────
function descriptionPrompt(title, type) {
  return `
You are a knowledgeable assistant for a personal movie and book library app called MediaShelf.

Generate metadata for the following ${type}:
Title: "${title}"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "description": "2-3 sentence engaging description/synopsis of this ${type.toLowerCase()}",
  "genre": "Primary genre (single genre like 'Sci-Fi', 'Thriller', 'Fantasy', 'Self-Help', etc.)",
  "summary": "One sentence tagline or short summary",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Rules:
- description should be engaging and informative, 2-3 sentences
- genre must be a single, specific genre string
- tags should be 3-5 relevant keywords (mood, themes, style)
- If you don't recognize the title, generate plausible metadata based on the title words
`;
}

module.exports = {
  libraryAnalysisPrompt,
  recommendationPrompt,
  searchPrompt,
  descriptionPrompt,
};

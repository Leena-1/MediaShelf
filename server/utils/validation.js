const validateItemInput = (data) => {
  const errors = [];
  
  const type = data.type ? data.type.trim() : '';
  const title = data.title ? data.title.trim() : '';
  const genre = data.genre ? data.genre.trim() : '';
  const authorOrDirector = data.authorOrDirector ? data.authorOrDirector.trim() : '';
  const rating = Number(data.rating);
  const releaseYear = Number(data.releaseYear);
  const description = data.description ? data.description.trim() : '';
  const status = data.status ? data.status.trim() : 'Plan to Watch';
  const tags = Array.isArray(data.tags) ? data.tags.map(t => t.trim()).filter(Boolean) : [];

  if (!type || !['Movie', 'Book'].includes(type)) {
    errors.push('Type must be either "Movie" or "Book"');
  }
  if (!title) {
    errors.push('Title is required');
  }
  if (!genre) {
    errors.push('Genre is required');
  }
  if (!authorOrDirector) {
    errors.push(type === 'Movie' ? 'Director is required' : 'Author is required');
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }
  
  const currentYear = new Date().getFullYear();
  if (isNaN(releaseYear) || releaseYear < 1800 || releaseYear > currentYear + 5) {
    errors.push(`Release year must be a number between 1800 and ${currentYear + 5}`);
  }
  if (!description) {
    errors.push('Description is required');
  }
  if (!['Plan to Watch', 'Watching', 'Completed', 'On Hold'].includes(status)) {
    errors.push('Invalid status value. Must be Plan to Watch, Watching, Completed, or On Hold');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanData: {
      type,
      title,
      genre,
      authorOrDirector,
      rating,
      releaseYear,
      description,
      status,
      tags,
      poster: data.poster ? data.poster.trim() : '',
      favorite: !!data.favorite
    }
  };
};

module.exports = { validateItemInput };

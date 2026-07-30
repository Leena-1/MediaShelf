const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
  getStats,
  addItemReview,
  getItemReviews,
  importItems,
  toggleFavorite
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all routes with JWT Authentication

// Aggregate analytics & imports
router.get('/stats', getStats);
router.post('/import', importItems);

// Favorite binding
router.patch('/:id/favorite', toggleFavorite);

// Review bindings
router.post('/:id/reviews', addItemReview);
router.get('/:id/reviews', getItemReviews);

// Restore bindings
router.post('/:id/restore', restoreItem);

// CRUD routes
router.get('/', getItems);
router.post('/', createItem);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;

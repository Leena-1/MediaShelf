const express = require('express');
const router = express.Router();
const {
  getCollections,
  createCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection
} = require('../controllers/collectionController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all routes

router.get('/', getCollections);
router.post('/', createCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/add', addToCollection);
router.post('/:id/remove', removeFromCollection);

module.exports = router;

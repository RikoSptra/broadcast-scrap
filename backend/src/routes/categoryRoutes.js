const express = require('express');
const router = express.Router();
const { createCategory, updateCategory, deleteCategory, getAllCategory } = require('../controllers/category');

router.post('/', createCategory);
router.get('/', getAllCategory);
router.put('/:_id', updateCategory);
router.delete('/:_id', deleteCategory);

module.exports = router; 
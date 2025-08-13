const express = require('express');
const router = express.Router();
const { createBroadcast, getBroadcasts, getBroadcastById, updateBroadcast, deleteBroadcast } = require('../controllers/broadcastController');

router.post('/', createBroadcast);
router.get('/', getBroadcasts);
router.get('/:id', getBroadcastById);
router.put('/:id', updateBroadcast);
router.delete('/:id', deleteBroadcast);

module.exports = router; 
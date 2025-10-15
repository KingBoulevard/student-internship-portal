const express = require('express');
const router = express.Router();

// Test with a simple route first
router.get('/', (req, res) => {
    res.json({ message: 'Students route working!' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Get student ${req.params.id}` });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create student' });
});

module.exports = router; 
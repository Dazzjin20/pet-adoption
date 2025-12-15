const express = require('express');
const taskController = require('../controller/taskController');

const router = express.Router();

// All task-related requests now go through the main taskController.
router.post('/', taskController.create);
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

module.exports = router;
const mongoose = require('./../../database');

const TarefaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    require: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    require: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  completed: {
    type: Boolean,
    require: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tarefa = mongoose.model('Tarefa', TarefaSchema);

module.exports = Tarefa;

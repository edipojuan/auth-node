const mongoose = require('./../../database');

const ItemSchema = new mongoose.Schema({
  titulo: {
    type: String,
    require: true
  },
  descricao: {
    type: String,
    require: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  tarefas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tarefa'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;

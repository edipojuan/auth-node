const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Item = require('./../models/item');
const Tarefa = require('./../models/tarefa');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const itens = await Item.find().populate(['user', 'tarefas']);
    res.send({ itens });
  } catch (err) {
    return res.status(400).send({ error: 'Ocorreu um erro ao obter os itens' });
  }
});

router.get('/:itemId', async (req, res) => {
  try {
    const itens = await Item.findById(req.params.itemId).populate(['user', 'tarefas']);
    res.send({ itens });
  } catch (err) {
    return res.status(400).send({ error: 'Ocorreu um erro ao obter um item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { titulo, descricao, tarefas } = req.body;
    const item = await Item.create({ titulo, descricao, user: req.userId });
    // console.log(item);

    await Promise.all(
      tarefas.map(async (tarefa) => {
        const itemTarefa = new Tarefa({ ...tarefa, item: item._id });

        await itemTarefa.save();

        item.tarefas.push(itemTarefa);
      })
    );

    await item.save();

    return res.send({ item });
  } catch (err) {
    return res.status(400).send({ error: 'Ocorreu um erro ao criar um item' });
  }
});

router.put('/:itemId', async (req, res) => {
  try {
    const { titulo, descricao, tarefas } = req.body;
    const item = await Item.findByIdAndUpdate(req.params.itemId, { titulo, descricao }, { new: true });

    item.tarefas = [];
    await Tarefa.remove({ item: item._id });

    await Promise.all(
      tarefas.map(async (tarefa) => {
        const itemTarefa = new Tarefa({ ...tarefa, item: item._id });

        await itemTarefa.save();

        item.tarefas.push(itemTarefa);
      })
    );

    await item.save();

    return res.send({ item });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: 'Ocorreu um erro ao tentar alterar um item' });
  }
});

router.delete('/:itemId', async (req, res) => {
  try {
    await Item.findByIdAndRemove(req.params.itemId);
    res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Ocorreu um erro ao tentar remover um item' });
  }
});

module.exports = (app) => app.use('/itens', router);

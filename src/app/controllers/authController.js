const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('./../../modules/mailer');

const authConfig = require('./../../config/auth.json');

const User = require('./../models/User');

const router = express.Router();

function generateToken(parans = {}) {
  return jwt.sign(parans, authConfig.secret, {
    expiresIn: 86400
  });
}

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ erro: 'Usuário já existe' });
    }

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: 'Ocorreu um erro ao tentar cadastrar' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(400).send({ erro: 'Usuário não encontrado' });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ erro: 'Senha inválida' });
  }

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });
});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ erro: 'Usuário não encontrado' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });

    mailer.sendMail(
      {
        to: email,
        fron: 'edipojs@gmail.com',
        template: 'auth/forgot_password',
        context: { token }
      },
      (err) => {
        if (err) {
          return res.status(400).send({ erro: 'Não foi possível recuperar o e-mail' });
        }

        return res.send({ msg: 'E-mail enviado' });
      }
    );
  } catch (err) {
    res.status(400).send({ erro: 'Ocorreu um erro na recupação da senha' });
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

    if (!user) {
      return res.status(400).send({ erro: 'Usuário não encontrado' });
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ erro: 'Token inválido' });
    }

    const now = Date.now();

    if (now > user.passwordResetExpires) {
      return res.status(400).send({ erro: 'O token expirou, faça uma nova solicitação de recupeção e senha' });
    }

    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ erro: 'Ocorreu um erro ao tentar alterar a senha' });
  }
});

module.exports = (app) => app.use('/auth', router);

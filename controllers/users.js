const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const MongoError = require('../errors/mongo-err');
const SALT_ROUNDS = 10;

function getMe(req, res, next) {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        const { name, email } = user;
        res.status(200).send({ name, email });
      } else {
        throw new NotFoundError('Нет пользователя с таким id');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
}

function updateMe(req, res, next) {
  const {  name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .then((user) => {
      if (user) {
        const { name, email } = user;
        res.status(200).send({ name, email });
      } else {
        throw new NotFoundError('Нет пользователя с таким id');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
}

function register(req, res, next) {
  const { email, password, name } = req.body;
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      email, password, name, password: hash,
    }))
    .then((user) => {
      const { name, email } = user;
      res.status(201).send({ name, email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new MongoError('Пользователь с такой почтой уже зарегистрирован'));
      } else {
        next(err);
      }
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const token = jwt.sign(
            { _id: user._id },
            'some-secret-key',
            { expiresIn: '7d' },
          );
          res
            .cookie('jwt', token, { httpOnly: true, maxAge: 3600000 * 24 * 7 })
            .send({ message: 'Авторизация прошла успешно' });
        });
    })
    .catch(next);
}

module.exports = {
  getMe,
  updateMe,
  register,
  login
};
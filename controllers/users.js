const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const MongoError = require('../errors/mongo-err');

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


module.exports = {
  getMe,
  updateMe
};
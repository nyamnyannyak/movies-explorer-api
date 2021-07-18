const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRoutes = require('./users');
const movieRoutes = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');
const { register, login } = require('../controllers/users');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
  }),
}), register);
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
router.use(auth);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.post('/signout', (req, res, next) => {
  try {
    res.clearCookie('jwt').send({ message: 'Вы вышли из аккаунта' });
  } catch (err) {
    next(err);
  }
});
router.use('/*', (req, res, next) => next(new NotFoundError('Путь не найден')));

module.exports = router;

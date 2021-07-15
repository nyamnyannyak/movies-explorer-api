const router = require('express').Router();
const userRoutes = require('./users');
const movieRoutes = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');
const { register, login } = require('../controllers/users');

router.post('/signup', register);
router.post('/signin', login);
router.use(auth);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/signout', (req, res, next) => {
  try {
    res.clearCookie('jwt').send({message: 'Вы вышли из аккаунта'});
  }
  catch(err) {
    next(err);
  }
})
router.use('/*', (req, res, next) => next(new NotFoundError('Путь не найден')));

module.exports = router;


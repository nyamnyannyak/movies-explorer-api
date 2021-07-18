const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { linkRegex } = require('../utils/link-regex');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(linkRegex),
    trailer: Joi.string().required().pattern(linkRegex),
    thumbnail: Joi.string().required().pattern(linkRegex),
    movieId: Joi.string(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string(),
  }),
}), deleteMovie);

module.exports = router;

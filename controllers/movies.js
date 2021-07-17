const Movie = require('../models/movie');
const mongoose = require('mongoose');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');


function getMovieResponse(movie) {
  const {
    country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId
  } = movie;
  return {
    country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId
  };
}

function getMovies (req, res, next) {
  Movie.find({owner: req.user._id})
    .then((movies) => {
      res.status(200).send(movies.map((movie) => getMovieResponse(movie)));
    })
    .catch(next);
}

function createMovie (req, res, next) {
  const { country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId } = req.body;
  Movie.findOne({ owner: req.user._id, movieId: movieId })
    .then((movie) => {
      if (movie) {
        throw new ForbiddenError('Этот фильм уже добавлен в сохраненные');
      }
      return Movie.create({ country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId, owner: req.user._id })
    })
    .then((movie) => res.status(201).send(getMovieResponse(movie)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
}

function deleteMovie (req, res, next) {
  Movie.findOne({ owner: req.user._id, movieId: req.params.movieId })
    .then((movie) => {
      if(!movie) {
        throw new NotFoundError('Нет фильма с таким id');
      }
      if (movie.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('Нет прав на совершение действия');
      }
      return Movie.findOneAndRemove({ movieId: req.params.movieId });
    })
    .then(() => {
      res.status(200).send({ message: 'Фильм удален' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie
};
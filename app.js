const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const { handleErrors } = require('./middlewares/errors-handler');
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/moviesprojectdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(routes);
app.use(handleErrors);
app.listen(PORT);

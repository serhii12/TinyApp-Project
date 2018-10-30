// load the things we need
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const generateRandomString = () => {
  const random = Math.random()
    .toString(36)
    .substring(7);
  return random;
};

// view engine setup
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVnl: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => {
  // if user is logged in:
  //  (Minor) redirect to /urls
  res.redirect(301, '/urls');
  // if user is not logged in:
  // (Minor) redirect to /login
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('pages/urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('pages/urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const getShortVersion = generateRandomString();
  urlDatabase[getShortVersion] = req.body.longURL;
  res.redirect(301, `/urls/${getShortVersion}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

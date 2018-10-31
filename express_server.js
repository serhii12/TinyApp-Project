// load the things we need
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

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

// cookies setup
app.use(cookieParser());

// Method override
app.use(methodOverride('_method'));

const urlDatabase = {
  b2xVnl: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.redirect(301, '/urls');
});

app.get('/login', (req, res) => {
  res.render('pages/urls_login', {
    username: req.cookies.username,
  });
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('pages/url_register');
});

app.get('/urls', (req, res) => {
  if (req.cookies.username) {
    res.render('pages/urls_index', {
      urls: urlDatabase,
      username: req.cookies.username,
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new', (req, res) => {
  if (req.cookies.username) {
    res.render('pages/urls_new', {
      username: req.cookies.username,
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  if (req.cookies.username) {
    res.render('pages/urls_show', {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: req.cookies.username,
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const getShortVersion = generateRandomString();
  urlDatabase[getShortVersion] = req.body.longURL;
  res.redirect(301, '/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

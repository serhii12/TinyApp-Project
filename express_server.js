// load the things we need
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8080;

// Helper function
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

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'panchyshyn.serhii@gmail.com',
    password: '123',
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: 'user3@example.com',
    password: 'disWather-funk',
  },
};

const urlDatabase = {
  b2xVnl: { userID: 'user2RandomID', url: 'http://www.lighthouselabs.ca' },
  b2x3nl: { userID: 'user3RandomID', url: 'http://www.stuf.ca' },
  '9sm5xK': { userID: 'user2RandomID', url: 'http://www.google.com' },
};

// Helper function
const urlsForUser = id => {
  const newLinks = [];
  Object.keys(urlDatabase).forEach(prop => {
    if (urlDatabase[prop].userID === id) {
      newLinks.push({ shortUrl: prop, longUrl: urlDatabase[prop].url });
    }
  });
  return newLinks;
};

app.get('/', (req, res) => {
  res.redirect(301, '/login');
});

app.get('/login', (req, res) => {
  res.render('pages/urls_login', {
    user: users[req.cookies.user_id],
  });
});

app.post('/login', (req, res) => {
  const user = Object.values(users).find(prop => prop.email === req.body.email);
  if (user) {
    if (user.password === req.body.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    }
  } else {
    res.redirect('/register');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('pages/url_register');
});

app.post('/register', (req, res) => {
  const getShortVersion = generateRandomString();
  users[getShortVersion] = {
    id: getShortVersion,
    email: req.body.email,
    password: req.body.password,
  };
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  if (req.cookies.user_id) {
    const userUrls = urlsForUser(req.cookies.user_id);
    res.render('pages/urls_index', {
      urls: userUrls,
      user: users[req.cookies.user_id],
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id) {
    res.render('pages/urls_new', {
      user: users[req.cookies.user_id],
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  if (req.cookies.user_id) {
    res.render('pages/urls_show', {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      user: users[req.cookies.user_id],
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
  urlDatabase[getShortVersion] = {
    userID: req.cookies.user_id,
    url: req.body.longURL,
  };
  res.redirect(301, '/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

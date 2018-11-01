// load the things we need
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');

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
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// cookies setup
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Method override
app.use(methodOverride('_method'));

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@ex.com',
    password: '$2a$10$cmdCtLAKRFvsMUPxijHsLO2GRbVn54aCTqHxTTxNiijIB0kTvvwVW',
    // password = 456;
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'panchyshyn.serhii@gmail.com',
    password: '$2a$10$JriaGRYRwR5OArQYg2H8Delv6Z3N5oenF9ieYfY.DHtn7gtRA/hXW',
    // password = 123
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: 'use232@example.com',
    password: '$2a$10$6tPf8fypNC0YVm3fo0XKJ.2T..8CdyznoX7oYlZaunyPnyguRd8PS',
    // password = coolPassword212121dfscs
  },
};

const urlDatabase = {
  b1xVnl: { userID: 'userRandomID', url: 'http://www.lighthouselabs.ca' },
  b2x3nl: { userID: 'user2RandomID', url: 'http://www.stuf.ca' },
  b3sm5l: { userID: 'user2RandomID', url: 'http://www.google.com' },
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

// GET Route to Show the Home Page
app.get('/', (req, res) => {
  res.redirect(301, '/login');
});

app.get('/login', (req, res) => {
  res.render('pages/urls_login', {
    user: users[req.session.user_id],
  });
});

app.post('/login', (req, res) => {
  const user = Object.values(users).find(prop => prop.email === req.body.email);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.send("Sorry, you're not logged in correctly.");
    }
  } else {
    res.redirect('/register');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
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
    password: bcrypt.hashSync(req.body.password, 10),
  };
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userUrls = urlsForUser(req.session.user_id);
    res.render('pages/urls_index', {
      urls: userUrls,
      user: users[req.session.user_id],
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    res.render('pages/urls_new', {
      user: users[req.session.user_id],
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  if (
    urlDatabase[req.params.id] &&
    req.session.user_id === urlDatabase[req.params.id].userID
  ) {
    res.render('pages/urls_show', {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      user: users[req.session.user_id],
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const getShortVersion = generateRandomString();
  urlDatabase[getShortVersion] = {
    userID: req.session.user_id,
    url: req.body.longURL,
  };
  res.redirect(301, '/urls');
});

app.delete('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.put('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

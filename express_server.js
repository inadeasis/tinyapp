const express = require("express");
const cookieSession = require("cookie-session");
const {getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000 // expiration: 24h
}));

// db links
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users objects
  const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "123123"
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

app.get("/", (req, res) => {
  const userId = req.session.userId;
    if (userId) {
      res.redirect("/urls");
    } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    urls: urlsForUser(userId),
    user: user,
  };
  if (!user ) {
    return res
      .status(403)
      .send(
        "<html><head> <title>Error</title> </head><body> <h1>Error</h1> <p>Login to view URLs</p> </body></html>"
      );
  }
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.userId]
    };
  res.render("urls_new", templateVars);
}});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  const userId = req.session.userId;
  const user = users[userId];

  if (!user ) {
    return res
      .status(403)
      .send(
        "<html><head> <title>Error</title> </head><body> <h1>Error</h1> <p>Login to View URLs.</p> </body></html>"
      );
  }
  if (url) {
    res.render("urls_show", { shortURL, longURL: url.longURL });
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.send("Login Required");
    return;
  }

  const id = generateRandomString(6)
  urlDatabase[id] = { longURL: req.body.longURL, userID: userId };
  res.redirect(`/urls/`)
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId
  const shortURL = req.params.id;
  
  if (!shortURL) {
    res.status(404).send(
      "<html><head> <title>Error</title> </head> <body> <h1>Error</h1> <p>URL Does Not Exist</p> </body></html>"
    );
  }
 
  // if not logged in
  if (!req.session.userId) {
    return res.status(403).send("Please login to delete URLs.");
  }

  // if URL in db
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  // if user owns url
  if (urlDatabase[shortURL].userID !== req.session.userId) {
    return res.status(403).send("You are not the owner of this URL.");
  }

  delete urlDatabase[shortURL];
  res.redirect(`/urls`)
})

app.post("/urls/:id/", (req, res) => {
  const shortURL = req.params.id; 
  const userId = req.session.userId;
  const user = users[userId];

   if (!user) {
    res.send("Login Required");
    return;
  }
  if (urlDatabase[shortURL].userID !== userId) {
    res.send("This URL does not belong to you.");
    return;
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is incorrect");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// endpoint that handles the registration form data
app.post("/register", (req, res) => {
  const id = generateRandomString()

  // Check if the e-mail or password are empty strings, email is already in use
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email) {
    res.status(400).send('Please enter required fields');
    return;
  }
  if (!password) {
    res.status(400).send('Please enter required fields');
    return;
  }

  for (let id in users) {
    if (users[id].email === email) {
      res.status(400).send('Email already in use');
      return;
    }
  }
    users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
    req.session.userId = id;
    res.redirect(`/urls/${id}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  maxAge: 24 * 60 * 60 * 1000 // Expiration: 24 hours
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
      password: "dishwasher-funk"
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };


  const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};


function urlsForUser(id) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

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
    urls: urlsForUser,
    user: user,
  };
  //   if (!user ) {
  //   return res
  //     .status(403)
  //     .send(
  //       "<html><head> <title>Error</title> </head><body> <h1>Error</h1> <p>Please login or register first.</p> </body></html>"
  //     );
  // }
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
  res.render("urls_new", templateVars);
}});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
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
  // res.cookie('user_id', user.id);
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  
  const templateVars = {
    user: users[req.session.userId]
  };
  // res.cookie('user_id', user.id);
  res.render("login", templateVars);
});

// Generate Random String for Short URL
const generateRandomString = () => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
}

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const userId = req.session.user_id;
  if (!userId) {
    res.send("Login Required");
    return;
  }

  const id = generateRandomString()
  urlDatabase[id] = { longURL: req.body.longURL, userID: userId };
  res.redirect(`/urls/${id}`)
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  
  console.log(req.body); 
  delete urlDatabase[shortURL];
  res.redirect(`/urls`)
})

app.post("/urls/:id/", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL
  const userId = req.session.user_id;

   if (!userId) {
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
    req.session.user_id = user.id;
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
  console.log(req.body); // Log the POST request body to the console
  
  const id = generateRandomString()
  // Check if the e-mail or password are empty strings, email is already in use
  const email = req.body.email;
  const password = req.body.password;
  const hashed = bcrypt.hashSync(password, 10); 

  if (!email || !password) {
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
    password: hashed
  };
    req.session.user_id = id;
    res.redirect(`/urls/${id}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



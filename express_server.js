const express = require("express");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.use(express.json())

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
   res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let urls = {};
  let user = null;
  if (userId ) {
    urls = urlsForUser(userId );
    user = user[userId ];
  }
  const templateVars = {
    urls,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: user[req.session.user_id]
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
    user: users[req.session.user_id]
  };
  // res.cookie('user_id', user.id);
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  
  const templateVars = {
    user: users[req.session.user_id]
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
  
  const id = generateRandomString()
  const longURL = req.body.longURL;
  urlDatabase[id] = req.body.longURL;

  user[id] = {
    id: id,
    email: email,
    password: hashed
  };

  res.redirect(`/urls/${id}`)
});

// Add POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req, res) => {

  const shortURL = req.params.id;
  

  console.log(req.body); 
  delete urlDatabase[shortURL];
  res.redirect(`/urls`)
})

app.post("/urls/:id/", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.params.longURL;
  const userId = req.session.user_id;

   if (!userId) {
    res.send("Please login first.");
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

  for (let id in user) {
    if (user[id].email === email) {
      res.status(400).send('Email already in use');
      return;
    }
  }
    req.session.user_id = userId;
    res.redirect(`/urls/${id}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Users Object
  const user = {
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

const express = require("express");
const cookieParser = require('cookie-parser')
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
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  
  const templateVars = { 
  urls: urlDatabase,
  username: req.cookies["username"], };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
   const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
   res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.use(express.urlencoded({ extended: true }));

// Generate Random String for Short URL
const generateRandomString = () => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
}

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  
  const id = generateRandomString()
  const longURL = req.body.longURL;

  urlDatabase[id] = req.body.longURL

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

  console.log(req.body); 
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`)
})

app.post("/login", (req, res) => {
  // Set the username cookie using the value from the form
  res.cookie('username', req.body.username);

  // Redirect the user to the /urls page after setting the cookie
  res.redirect(`/urls`);
});

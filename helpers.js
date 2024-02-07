const { urlDatabase } = require('./database');
const getUserByEmail = function(email, database) {
  // To avoid duplication of user emails
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null; // If user is not found
};

// Creates our short URL string
const generateRandomString = () => {
  let randomString = (Math.random() + 1).toString(36).substring(6);
  return randomString;
}
// Uses the generateRandomString function to generate a random string length 6
const randomString = generateRandomString(6);

const urlsForUser = (id) => {
  let urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

const checkUserAccess = (userId, shortURL, urlDatabase) => {
  if (!userId) {
    return { status: 403, message: "Please log in." };
  } else if (!urlDatabase || !urlDatabase[shortURL]) {
    return { status: 404, message: "URL not found." };
  } else if (urlDatabase[shortURL].userID !== userId) {
    return { status: 403, message: "Access denied." };
  }
  return null;
};


// Export the function
module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  checkUserAccess
};
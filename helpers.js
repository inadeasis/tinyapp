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
    if (urlDatabase[shortURL].userId === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

// Export the function
module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};
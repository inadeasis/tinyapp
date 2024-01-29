const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return undefined with non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});

// Assuming your server is running on localhost:3000
const serverUrl = "http://localhost:3000";
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Login and Access with Session Cookie", () => {
  it("should return status code 403 for unauthorized access", () => {
    // Perform login with POST request
    return chai
      .request(serverUrl)
      .post("/login")
      .send({
        email: "user2@example.com",
        password: "dishwasher-funk",
      })
      .then((loginRes) => {
        // Assert that login was successful
        expect(loginRes).to.have.status(200);
        expect(loginRes).to.have.cookie("session"); // Assuming your session cookie is named 'session'

        // Use the session cookie in subsequent requests
        const agent = chai.request.agent(serverUrl);

        // Make GET request with session cookie
        return agent.get("/urls/b2xVn2").then((getResponse) => {
          // Expecting status code 403 for unauthorized access
          expect(getResponse).to.have.status(403);

          // Close the agent to clean up the session
          agent.close();
        });
      });
  });
});


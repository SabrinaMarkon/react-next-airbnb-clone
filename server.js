// We use require instead of import because server.js needs to use the CommonJS syntax
// to use modules instead of ES Modules, because this file is not going through the
// webpack pipeline that Next.js usually does (Copes, F.).
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const next = require("next");

// The store for site sessions to be saved to the database instead of default in-memory storage:
const SequelizeStore = require("connect-session-sequelize")(session.Store);
// require User model.
const User = require("./models/user.js");
const House = require("./models/house.js");
const Review = require("./models/review.js");

// require database and sequelize:
const sequelize = require("./database.js");
// Configure the sessionStore variable:
const sessionStore = new SequelizeStore({
  db: sequelize,
});

const passport = require("passport");
// passport-local is for handling authentication locally instead of third party sites (ie. facebook, github, etc.)
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      if (!email || !password) {
        done("Email and password are required", null);
        return;
      }
      // Use Sequelize's findOne function to check if there is a user in the db:
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        done("User not found", null);
        return;
      }
      // check if password is valid using prototype function isPasswordValid from model.js:
      const valid = await user.isPasswordValid(password);
      if (!valid) {
        done("Email and password do not match", null);
        return;
      }
      done(null, user); // if user is found, pass the user object to done.
    }
  )
);

// Data we need to send to the user's browser as a cookie:
passport.serializeUser((user, done) => {
  done(null, user.email);
});
// Given the user information from the cookie (email), how to retrieve user data from db:
passport.deserializeUser((email, done) => {
  User.findOne({ where: { email: email } }).then((user) => {
    done(null, user);
  });
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();
  // middleware for handling sessions:
  server.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
  server.use(bodyParser.json()); // parse application/json
  server.use(
    session({
      secret:
        "magpiescrowspigeonssparrowschickadeesgracklesbluejaysravensseagullsbudgiescockatooscockatielsstarlingsflickers", // random string
      resave: false,
      saveUninitialized: true,
      name: "nextbnb",
      cookie: {
        secure: false, // CRITICAL on localhost (Copes, F.)
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      store: sessionStore, // above configured to store sessions in db.
    }),
    passport.initialize(), // initialize passport to be ready to use.
    passport.session() // handle login sessions.
  );

  // user registration endpoint (moved from register.js to centralize API)
  // Runs the code in passport.use(new LocalStrategy()) above.
  server.post("api/auth/register", async (req, res) => {
    const { email, password, passwordconfirmation } = req.body;

    // Make sure password fields match.
    if (password !== passwordconfirmation) {
      res.end(
        JSON.stringify({ status: "error", message: "Passwords do not match" })
      );
      return;
    }

    try {
      // Create user in database with User model (model.js).
      const user = await User.create({ email, password });

      // Create a session so we can login the user immediately after they register.
      req.login(user, (err) => {
        if (err) {
          // res.statusCode = 500;
          res.end(JSON.stringify({ status: "error", message: err }));
          return;
        }
        // Registration worked and user should be logged in!
        return res.end(
          JSON.stringify({ status: "success", message: "Logged in" })
        );
      });
    } catch (error) {
      let message = "An error occurred";
      if (error.name === "SequelizeUniqueConstraintError") {
        message = "User already exists"; // instead of displaying entire detailed error message to user.
      }
      res.end(JSON.stringify({ status: "error", message }));
    }
  });

  server.post("/api/auth/login", async (req, res) => {
    // console.log("body parsing", req.body); // undefined without body-parser middleware!!!
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            status: "error",
            message: err,
          })
        );
        return;
      }

      if (!user) {
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            status: "error",
            message: "No user matching credentials" + hi,
          })
        );
        return;
      }

      req.login(user, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              status: "error",
              message: err,
            })
          );
          return;
        }

        return res.end(
          JSON.stringify({
            status: "success",
            message: "Logged in",
          })
        );
      });
    })(req, res, next);
  });

  server.post("/api/auth/logout", (req, res) => {
    req.logout();
    req.session.destroy();
    return res.end(
      JSON.stringify({
        status: "success",
        message: "Logged out",
      })
    );
  });

  server.get("/api/houses", (req, res) => {
    House.findAndCountAll().then((result) => {
      const houses = result.rows.map((house) => house.dataValues);
      res.writeHead(200, {
        "Content-type": "application/json",
      });
      res.end(JSON.stringify(houses));
    });
  });

  server.get("/api/houses/:id", (req, res) => {
    const { id } = req.params;
    House.findByPk(id).then((house) => {
      if (house) {
        res.writeHead(200, {
          "Content-type": "application/json",
        });
        res.end(JSON.stringify(house.dataValues));
      } else {
        res.writeHead(404, {
          "Content-type": "application/json",
        });
        res.end(
          JSON.stringify({
            message: "Not found",
          })
        );
      }
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

//sessionStore.sync(); // Only run this ONCE to automatically create the Sessions table in the database, then comment out.

// Keep these during development so they update the table whenever that model is changed.
User.sync({ alter: true });
House.sync({ alter: true });
Review.sync({ alter: true });

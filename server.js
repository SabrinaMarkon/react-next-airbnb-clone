// We use require instead of import because server.js needs to use the CommonJS syntax
// to use modules instead of ES Modules, because this file is not going through the
// webpack pipeline that Next.js usually does (Copes, F.).
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const next = require("next");
const Op = require("sequelize").Op;

// The store for site sessions to be saved to the database instead of default in-memory storage:
const SequelizeStore = require("connect-session-sequelize")(session.Store);
// require User model.
const User = require("./models/user.js");
const House = require("./models/house.js");
const Review = require("./models/review.js");
const Booking = require("./models/booking.js");

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

  // parse application/json
  server.use(
    bodyParser.json({
      verify: (req, res, buf) => {
        // makes rawBody available which is needed for Stripe processing below.
        req.rawBody = buf;
      },
    })
  );

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

  // Get list of all dates that a house is booked:
  const getDatesBetweenDates = (startDate, endDate) => {
    let dates = [];
    while (startDate < endDate) {
      dates = [...dates, new Date(startDate)];
      startDate.setDate(startDate.getDate() + 1);
    }
    dates = [...dates, endDate];
    return dates;
  };
  server.post("/api/houses/booked", async (req, res) => {
    const houseId = req.body.houseId;
    const results = await Booking.findAll({
      where: {
        houseId: houseId,
        endDate: {
          [Op.gte]: new Date(),
        },
      },
    });
    let bookedDates = [];
    for (const result of results) {
      const dates = getDatesBetweenDates(
        new Date(result.startDate),
        new Date(result.endDate)
      );
      bookedDates = [...bookedDates, ...dates];
    }
    // remove duplicates:
    bookedDates = [...new Set(bookedDates.map((date) => date))];
    res.json({
      status: "success",
      message: "ok",
      dates: bookedDates,
    });
  });

  // Check that a date range to book a house is already taken or available:
  const canBookThoseDates = async (houseId, startDate, endDate) => {
    // Find overlapping dates in the database.
    const results = await Booking.findAll({
      where: {
        houseId: houseId,
        startDate: {
          [Op.lte]: new Date(endDate),
        },
        endDate: {
          [Op.gte]: new Date(startDate),
        },
      },
    });
    return !(results.length > 0);
  };
  server.post("/api/houses/check", async (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const houseId = req.body.houseId;
    let message = "free";
    if (!(await canBookThoseDates(houseId, startDate, endDate))) {
      message = "busy"; // dates were already booked for this house.
    }
    res.json({
      status: "success",
      message: message,
    });
  });

  server.post("/api/houses/reserve", async (req, res) => {
    // Make sure user is logged in to be able to book a house:
    if (!req.session.passport) {
      res.writeHead(403, {
        "Content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );
      return;
    }
    // Check if the user can book their chosen dates:
    if (
      !(await canBookThoseDates(
        req.body.houseId,
        req.body.startDate,
        req.body.endDate
      ))
    ) {
      res.writeHead(200, {
        "Content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message:
            "House is already booked on some or all of the selected dates",
        })
      );
      return;
    }
    const userEmail = req.session.passport.user;
    User.findOne({
      where: { email: userEmail },
    }).then((user) => {
      Booking.create({
        houseId: req.body.houseId,
        userId: user.id,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        sessionId: req.body.sessionId,
      }).then(() => {
        res.writeHead(200, {
          "Content-type": "application/json",
        });
        res.end(
          JSON.stringify({
            status: "success",
            message: "ok",
          })
        );
      });
    });
  });

  server.get("/api/houses/:id", (req, res) => {
    const { id } = req.params;
    House.findByPk(id).then((house) => {
      if (house) {
        // Get reviews from database:
        Review.findAndCountAll({
          where: {
            houseId: house.id,
          },
        }).then((reviews) => {
          house.dataValues.reviews = reviews.rows.map(
            (review) => review.dataValues
          );
          // Attach the reviews to the data sent to the response:
          house.dataValues.reviewsCount = reviews.count;

          res.writeHead(200, {
            "Content-type": "application/json",
          });
          res.end(JSON.stringify(house.dataValues));
        });
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

  // Create a Stripe session for a transaction.
  server.post("/api/stripe/session", async (req, res) => {
    const amount = req.body.amount;
    const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          name: "Booking house on NextBNB",
          amount: amount * 100,
          currency: "usd",
          quantity: 1,
        },
      ],
      // bookings route isn't in server.js because it is a file directly in /pages (Next.js)
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/bookings`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL}/bookings`,
    });
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        status: "success",
        sessionId: session.id,
        stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      })
    );
  });

  // Endpoint to analyze Stripe webhook:
  server.post("/api/stripe/webhook", async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (error) {
      res.writeHead(400, {
        "Content-type": "application/json",
      });
      console.error(error.message);
      res.end(
        JSON.stringify({
          status: "success",
          message: `Webhook Error: ${error.message}`,
        })
      );
      return;
    }
    if (event.type === "checkout.session.completed") {
      const sessionId = event.data.object.id;
      try {
        // Update database to mark booking as paid:
        Booking.update({ paid: true }, { where: { sessionId } });
      } catch (error) {
        console.error(error);
      }
    }
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    // Send a received: true JSON response to Stripe to tell it that "we got it":
    res.end(
      JSON.stringify({
        received: true,
      })
    );
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
Booking.sync({ alter: true });

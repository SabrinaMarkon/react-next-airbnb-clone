// We use require instead of import because server.js needs to use the CommonJS syntax
// to use modules instead of ES Modules, because this file is not going through the
// webpack pipeline that Next.js usually does (Copes, F.).
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const next = require("next");
const Op = require("sequelize").Op;
const sanitizeHtml = require("sanitize-html");
const fileupload = require("express-fileupload");

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

  // Make sure server can parse file uploads with the express-fileupload package:
  server.use(
    //...
    fileupload()
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

  // Use this route to clean out unpaid bookings:
  server.post("/api/bookings/clean", (req, res) => {
    Booking.destroy({
      where: {
        paid: false,
      },
    });

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        status: "success",
        message: "ok",
      })
    );
  });

  server.get("/api/bookings/list", async (req, res) => {
    // Check if a user is logged in using passport so we can show their bookings:
    if (!req.session.passport || !req.session.passport.user) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );

      return;
    }

    const userEmail = req.session.passport.user;
    const user = await User.findOne({ where: { email: userEmail } });

    Booking.findAndCountAll({
      where: {
        paid: true,
        endDate: {
          // Only get upcoming bookings.
          [Op.gte]: new Date(),
        },
        userId: user.id,
      },
      order: [["startDate", "ASC"]],
    }).then(async (result) => {
      // wrap Promise.all around the map() iteration so we can use async inside the map!
      const bookings = await Promise.all(
        result.rows.map(async (booking) => {
          const data = {};
          data.booking = booking.dataValues;
          // Get some extra info about each House from the House table (using findByPk - "find by primary key")
          data.house = (await House.findByPk(data.booking.houseId)).dataValues;
          return data;
        })
      );
      res.writeHead(200, {
        "Content-type": "application/json",
      });
      res.end(JSON.stringify(bookings));
    });
  });

  server.get("/api/host/list", async (req, res) => {
    // Check if a user is logged in using passport so we can show their bookings:
    if (!req.session.passport || !req.session.passport.user) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );

      return;
    }

    const userEmail = req.session.passport.user;
    const user = await User.findOne({ where: { email: userEmail } });

    // Get houses that the user is a host of:
    const houses = await House.findAll({
      where: {
        host: user.id,
      },
    });
    // Get ids of the houses so we can look up their bookings:
    const houseIds = houses.map((house) => house.dataValues.id);
    // Get the bookings for any house that is in the houseIds array:
    const bookingsData = await Booking.findAll({
      where: {
        paid: true,
        houseId: {
          [Op.in]: houseIds,
        },
        endDate: {
          [Op.gte]: new Date(),
        },
      },
      order: [["startDate", "ASC"]],
    });

    const bookings = await Promise.all(
      bookingsData.map(async (booking) => {
        return {
          booking: booking.dataValues,
          house: houses.filter(
            (house) => house.dataValues.id === booking.dataValues.houseId
          )[0].dataValues,
        };
      })
    );

    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        bookings,
        houses,
      })
    );
  });

  // Host can create a new house listing:
  server.post("/api/host/new", async (req, res) => {
    const houseData = req.body.house; // submitted data about house.

    // Check if a user is logged in using passport.
    if (!req.session.passport || !req.session.passport.user) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );

      return;
    }

    const userEmail = req.session.passport.user;
    User.findOne({ where: { email: userEmail } }).then((user) => {
      houseData.host = user.id; // Add user.id to submitted data about house.

      // Clean the description and remove all tags except the ones we specifically allow.
      houseData.description = sanitizeHtml(houseData.description, {
        allowedTags: ["b", "i", "em", "strong", "p", "br"],
      });

      House.create(houseData).then(() => {
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

  // Host can edit the details of their house:
  server.post("/api/host/edit", async (req, res) => {
    const houseData = req.body.house; // submitted data about house.

    // Check if a user is logged in using passport.
    if (!req.session.passport || !req.session.passport.user) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );

      return;
    }

    const userEmail = req.session.passport.user;
    // look up the user:
    User.findOne({ where: { email: userEmail } }).then((user) => {
      // look up the house id:
      House.findByPk(houseData.id).then((house) => {
        // does the house exist in the db?
        if (house) {
          // Make sure the host for a house matches the user id:
          if (house.host !== user.id) {
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

          // Clean the description and remove all tags except the ones we specifically allow.
          houseData.description = sanitizeHtml(houseData.description, {
            allowedTags: ["b", "i", "em", "strong", "p", "br"],
          });

          // Update the house details using Sequelize update() method:
          House.update(houseData, {
            where: {
              id: houseData.id,
            },
          })
            .then(() => {
              res.writeHead(200, {
                "Content-type": "application/json",
              });
              res.end(
                JSON.stringify({
                  status: "success",
                  message: "ok",
                })
              );
            })
            .catch((err) => {
              res.writeHead(500, {
                "Content-type": "application/json",
              });
              res.end(JSON.stringify({ status: "error", message: err.name }));
            });
        } else {
          // house id isn't found in db:
          res.writeHead(404, {
            "Content-type": "application/json",
          });
          re.end(
            JSON.stringify({
              message: "Not found",
            })
          );
          return;
        }
      });
    });
  });

  // Upload an image to the server from the add/edit house form:
  server.post("/api/host/image", (req, res) => {
    if (!req.session.passport) {
      res.writeHead(403, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        })
      );

      return;
    }

    const image = req.files.image;
    // Name image file with a random filename so existing files with the same name will not be overwritten:
    const fileName = randomstring.generate(7) + image.name.replace(/\s/g, "");
    const path = __dirname + "/public/img/houses/" + fileName;

    // Use mv() method to upload the file:
    image.mv(path, (error) => {
      if (error) {
        console.error(error);
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ status: "error", message: error }));
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({ status: "success", path: "/img/houses/" + fileName })
      );
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
Booking.sync({ alter: true });

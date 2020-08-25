// We use require instead of import because server.js needs to use the CommonJS syntax 
// to use modules instead of ES Modules, because this file is not going through the 
// webpack pipeline that Next.js usually does (Copes, F.).
const express = require("express");
const session = require("express-session");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {

  const server = express();

  // middleware for handling sessions:
  server.use(
    session({
      secret: 'magpiescrowspigeonssparrowschickadeesgracklesbluejaysravensseagullsbudgiescockatooscockatielsstarlingsflickers', // random string
      resave: false,
      saveUninitialized: true,
      name: 'nextbnb',
      cookie: {
        secure: false, // CRITICAL on localhost (Copes, F.)
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    })
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

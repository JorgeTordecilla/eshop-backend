const expressJwt = require("express-jwt");

const authJwt = () => {
  const secret = process.env.JWT_SECRET;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/eshop\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/eshop\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
};

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }
  done();
}
module.exports = authJwt;

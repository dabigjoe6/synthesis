import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, user) => {
      console.error(err);
      if (err) {
        return res.json({
          status: 403,
          message: "invalid token or token expired",
        });
      }
      req.user = user;
      next();
    });
  } else {
    return res.json({
      status: 400,
      message: "no available token",
    });
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      _id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

export const verifyGoogleToken = async (req, res, next) => {
  try {
    const { code } = req.body;

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'postmessage');

    const tokenObject = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokenObject.tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    req.body["email"] = payload.email;

    next();
  } catch (err) {
    console.error("Couldn't verify google's token", err);
    res.status(422).json({
      message: "Couldn't verify google's token",
    });
  }
};
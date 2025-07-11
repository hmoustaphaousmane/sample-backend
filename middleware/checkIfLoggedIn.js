const jwt = require("jsonwebtoken");

const checkIfLoggedIn = (req, res, next) => {
  try {
    if(!req.headers.authorization){
      return res.status(400).send({
        message: "No token supplied"
      })
    }
    const [scheme, token] = req.headers.authorization.split(" ");
    // console.log(`Scheme:::: ${scheme}, token:::: ${token}`);

    if (scheme.toLowerCase() == "bearer") {
      const value = jwt.verify(token, process.env.JWT_KEY);
      // console.log(value);
      req.decoded = value;
      next();
    } else {
      // 422: Not processable
      res.status(422).send({
        message: "Invalid authentication scheme"
      })
    }
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = checkIfLoggedIn;

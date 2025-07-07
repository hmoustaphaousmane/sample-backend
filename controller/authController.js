const userModel = require("../schema/user");
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const emailExists = await userModel.findOne({ email });

  if (emailExists) {
    res.status(409).send({
    messages: "Email already exists"
    });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  await userModel.create({
    fullName, email, password: hashedPassword
  });

  res.send({
    message: 'User created successfully'
  });
};

module.exports = { register }

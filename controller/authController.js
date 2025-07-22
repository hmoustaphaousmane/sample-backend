const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const jwt = require("jsonwebtoken");

const userModel = require("../schema/user");
const otpModel = require("../schema/otp");

const generateOTP = require("../utility/generateOtp");
const smtp = require("../utility/sendEmail");

const register = async (req, res) => {
  const { fullName, email, role, password } = req.body;

  // todo: verify that the email and password are valid using joi

  const emailExists = await userModel.findOne({ email });

  if (emailExists) {
    res.status(409).send({
      messages: "Email already exists",
    });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await userModel.create({
    fullName,
    email,
    role,
    password: hashedPassword,
  });

  const otp = generateOTP();
  const generatedOTPToken = v4();

  const otpDetails = await otpModel.create({
    otp,
    otpToken: generatedOTPToken,
    userId: newUser._id,
    purpose: "verify-email",
  });
  // console.log(otpDetails);

  await smtp.sendMail({
    from: process.env.UERNAME,
    to: email,
    supject: "Company Name - Verify Email",
    html: `
      <div>
        <h1>Verify email</h1>
        <div>Your otp is: ${otp}</div>
      </div>
    `,
  });

  res.status(201).send({
    message: "User created successfully",
    otpToken: generatedOTPToken,
    purpose: "verify-email",
  });
};

const verifyOTP = async (req, res) => {
  const { otp, otpToken, purpose } = req.body;

  if (purpose != "verify-email") {
    res.status(422).send({
      message: "Invalid otp prupose",
    });
    return;
  }

  const otpDetails = await otpModel.findOne({ otpToken, purpose });

  if (!otpDetails) {
    res.status(422).send({
      message: "Invalid otp token",
    });
    return;
  }

  if (otp != otpDetails.otp) {
    res.status(422).send({
      message: "Invalid otp",
    });
    return;
  }

  await userModel.findByIdAndUpdate(otpDetails.userId, {
    isEmailVerified: true,
  });

  await otpModel.deleteMany({
    userId: otpDetails.userId,
    purpose: "verify-email",
  });

  res.send({
    message: "User email verified successfully",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await userModel.findOne({ email });

  if (!userDetail) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }

  const passwordMatch = bcrypt.compareSync(password, userDetail.password);

  if (!passwordMatch) {
    res.status(400).send({
      message: "Invalid credentials ",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: userDetail.id,
      email: userDetail.email,
      role: userDetail.role,
    },
    process.env.JWT_KEY
  );

  res.send({
    message: "Login successful",
    userDetail: {
      fullName: userDetail.fullName,
      email: userDetail.email,
    },
    token,
  });
};

module.exports = { register, verifyOTP, login };

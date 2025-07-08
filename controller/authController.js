const bcrypt = require("bcrypt");
const { v4 } = require("uuid");

const userModel = require("../schema/user");
const otpModel = require("../schema/otp");

const generateOTP = require("../utility/generateOtp");
const smtp = require("../utility/sendEmail");

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

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
    password: hashedPassword,
  });

  const otp = generateOTP();
  const generatedOTPToken = v4();

  const otpDetails = await otpModel.create({
    otp,
    otpToken: generatedOTPToken,
    userId: newUser._id,
    purpose: "verify-email"
  });

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

  res.send({
    message: "User email verified successfully",
  });
};

module.exports = { register, verifyOTP };

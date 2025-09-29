const request = require("supertest");

const httpServer = require("../app");
const userModel = require("../schema/user");
const otpModel = require("../schema/otp");
const mongoose = require("mongoose");

const email = "hmoustaphaousmane@gmail.com";

// beforeEach(); // Runs before each test
// afterEach(); // Runs after each test

// Runs before all tests
beforeAll(async () => {
  await userModel.findOneAndDelete({ email });
  await otpModel.deleteMany({});
});

// Runs agter all tests
afterAll(async () => {
  httpServer.close(); // Halt server

  await mongoose.disconnect(); // Disconnect mongosse from database
});

describe("Test for register and login features", () => {
  test("Register with full name, email, password and role", async () => {
    const response = await request(httpServer).post("/auth/register").send({
      fullName: "Hassane M. O.",
      email,
      password: "whatever",
      role: "customer",
    });
    // .set("Authorization", `Bearer ${token}`);

    // console.log(response);

    const userDetails = await userModel.findOne({ email });
    const otpDetails = await otpModel.findOne({
      userId: userDetails._id,
      purpose: "verify-email",
      otpToken: response.body.otpToken,
    });
    // Todo: Check OTP: optModel.findOne(){} and comparer with response.body.otpToken
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.otpToken).toBe(otpDetails.otpToken);
    expect(response.body.purpose).toBe("verify-email");
  });
});

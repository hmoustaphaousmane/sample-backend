const request = require("supertest");

// Increase Jest timeout (mongoose and bcrypt operations can might take more than 5s)
jest.setTimeout(20000); // 20s for all tests in this file

const httpServer = require("../app");
const userModel = require("../schema/user");
const otpModel = require("../schema/otp");
const mongoose = require("mongoose");

const fullName = "Hassane M. O.";
const email = `email${Date.now()}@gmail.com`;
let otpDetails;
let token = "";

// beforeEach(); // Runs before each test
// afterEach(); // Runs after each test

// Runs before all tests
beforeAll(async () => {
  await userModel.findOneAndDelete({ email });
  await otpModel.deleteMany({});
});

// Runs after all tests
afterAll(async () => {
  httpServer.close(); // Halt server

  await mongoose.disconnect(); // Disconnect mongoose from database
});

describe("Test for register, verify and login features", () => {
  test("Register with full name, email, password and role", async () => {
    const response = await request(httpServer)
      .post("/auth/register")
      .set("Content-Type", "application/json") // Not neccessary if sending a json object
      .send({
        fullName,
        email,
        password: "whatever",
        role: "customer",
      });
    // .set("Authorization", `Bearer ${token}`);

    // console.log(response);

    const userDetails = await userModel.findOne({ email });
    // console.log("User Details:", userDetails);

    otpDetails = await otpModel.findOne({
      userId: userDetails._id,
      purpose: "verify-email",
      otpToken: response.body.otpToken,
    });
    // console.log("OTP Details:", otpDetails);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.otpToken).toBe(otpDetails.otpToken);
    expect(response.body.purpose).toBe("verify-email");
  });

  test("Verify customer's email", async () => {
    const response = await request(httpServer).patch("/auth/verify").send({
      otp: otpDetails.otp,
      otpToken: otpDetails.otpToken,
      purpose: otpDetails.purpose,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User email verified successfully");
  });

  test("should Customer login with email and password", async () => {
    const response = await request(httpServer).post("/auth/login").send({
      email,
      password: "whatever",
    });

    token = response.body.token;

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.userDetail.fullName).toBe(fullName);
    expect(response.body.userDetail.email).toBe(email);
    expect(response.body.token).toBeTruthy();
  });
});

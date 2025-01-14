import request from "supertest";
import { app } from "../../src/index";
import { UserModel } from "../../src/models/userModel";
import { validUser } from "../helpers";
import { User } from "../../src/types/user";
import { setupTestDB } from "../helpers";

describe("Authentication Endpoints", () => {
  setupTestDB();

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.user.approvalStatus).toBe("pending");
    });

    it("should fail with invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, password: "123" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with duplicate email", async () => {
      await UserModel.create(validUser);
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    let user: User;

    beforeEach(async () => {
      user = await UserModel.create({
        ...validUser,
        approvalStatus: "approved",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(user.email);
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: validUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should fail with non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: validUser.password,
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should fail with invalid email format", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should fail with pending approval status", async () => {
      await UserModel.findByIdAndUpdate(user._id, {
        approvalStatus: "pending",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "Account not approved");
      expect(res.body).toHaveProperty("status", "pending");
    });
  });
});

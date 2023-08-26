import { app, request, expect, UserModel } from "./common.spec";

describe("/auth", () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });
  describe("GET /users", () => {
    it("should return all users", async () => {
      const users = [
        {
          username: "otagera",
          password: "12345678",
          email: "string",
          address: "string",
          firstname: "string",
          lastname: "string",
        },
        {
          username: "leo",
          password: "12345678",
          email: "string",
          address: "string",
          firstname: "string",
          lastname: "string",
        },
        {
          username: "lenxo",
          password: "12345678",
          email: "string",
          address: "string",
          firstname: "string",
          lastname: "string",
        },
      ];
      await UserModel.insertMany(users);
      const res = await request(app).get("/auth/users");
      expect(res.status).to.equal(200);
      expect(res.body.data.users.length).to.equal(3);
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user if valid id is passed", async () => {
      const user = new UserModel({
        username: "otagera",
        password: 12345678,
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      await user.save();
      const res = await request(app).get("/auth/users/" + user._id);
      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.have.property("username", user.username);
    });
    it("should return 404 error when invalid object id is passed", async () => {
      const res = await request(app).get("/auth/users/1");
      expect(res.status).to.equal(400);
    });
    it("should return 404 when valid object id is passed but does not exist", async () => {
      const res = await request(app).get("/auth/users/123456789012");
      expect(res.status).to.equal(404);
    });
  });

  describe("POST /signup", () => {
    it("should return new user when all request body is valid to signup", async () => {
      const res = await request(app).post("/auth/signup").send({
        username: "lenzo",
        password: "12345678",
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.have.property("username", "lenzo");
    });
  });

  describe("POST /login", () => {
    it("should throw error because of wrong username", async () => {
      const res = await request(app).post("/auth/signup").send({
        username: "lenzo",
        password: "12345678",
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.have.property("username", "lenzo");

      const loginWrongUsernameRes = await request(app)
        .post("/auth/login")
        .send({
          username: "lenzoo",
          password: "12345678",
        });
      expect(loginWrongUsernameRes.status).to.equal(401);
    });
    it("should throw an error because of wrong password", async () => {
      const res = await request(app).post("/auth/signup").send({
        username: "lenzo",
        password: "12345678",
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.have.property("username", "lenzo");

      const loginWrongPasswordRes = await request(app)
        .post("/auth/login")
        .send({
          username: "lenzo",
          password: "123456789",
        });
      expect(loginWrongPasswordRes.status).to.equal(402);
    });
    it("should return tokens after login in", async () => {
      const res = await request(app).post("/auth/signup").send({
        username: "lenzo",
        password: "12345678",
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.have.property("username", "lenzo");

      const loginRes = await request(app).post("/auth/login").send({
        username: "lenzo",
        password: "12345678",
        email: "string",
        address: "string",
        firstname: "string",
        lastname: "string",
      });
      expect(loginRes.status).to.equal(200);
    });
  });
});

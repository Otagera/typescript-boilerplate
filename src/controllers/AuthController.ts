import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { get, post, bodyValidator, controller } from "./decorators/index";
import { User, RequestWithBody } from "../interfaces";

const UserModel = mongoose.model<User>("User");

@controller("/auth")
class AuthController {
  @post("/login")
  @bodyValidator("username", "password")
  async userLogin(req: RequestWithBody, res: Response) {
    const { username, password } = req.body;
    const dataF = {
      message: "Auth failed!",
    };
    try {
      const users: User[] = await UserModel.find({
        username: username.toLowerCase(),
      });
      if (users.length < 1) {
        return res.statusJson(401, { data: dataF });
      }
      bcrypt.compare(password, users[0].password, (err, result) => {
        if (err) {
          return res.statusJson(401, { data: dataF });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: users[0].username,
              userId: users[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "48h",
            }
          );
          const data = {
            message: "Auth Successful",
            token: token,
            username: users[0].username,
          };
          return res.statusJson(200, { data: data });
        }
        return res.statusJson(402, { data: dataF });
      });
    } catch (error) {
      const data = {
        error,
        success: false,
      };
      return res.statusJson(500, { data: data });
    }
  }

  @post("/signup")
  @bodyValidator(
    "username",
    "password",
    "email",
    "address",
    "firstname",
    "lastname"
  )
  async userSignup(req: RequestWithBody, res: Response) {
    const { username, password, email, address, firstname, lastname } =
      req.body;
    try {
      const users: User[] = await UserModel.find({
        username: username.toLowerCase(),
      });

      if (users.length >= 1) {
        const data = {
          message: "Sorry this username has already been taken",
        };
        return res.statusJson(409, { data: data });
      } else {
        bcrypt.hash(password, 10, async (err, hash) => {
          if (err) {
            return res.statusJson(500, {
              data: {
                err: err,
              },
            });
          } else {
            const user = new UserModel({
              username: username.toLowerCase(),
              password: hash,
              email,
              address,
              firstname,
              lastname,
            });
            const newUser = await user.save();
            const data = {
              message: "User created",
              success: true,
              user: newUser,
            };
            return res.statusJson(200, { data: data });
          }
        });
      }
    } catch (error) {
      console.log("===============");
      console.log(error);
      console.log("===============");
      const data = {
        error,
        success: false,
      };
      return res.statusJson(500, { data: data });
    }
  }

  @get("/exist/:username")
  async checkUserExistence(req: Request, res: Response) {
    const { username } = req.params;
    let data = { status: false };
    try {
      const user: User = await UserModel.findOne({
        username: username,
      });
      if (!user) {
        return res.statusJson(404, { data: data });
      }
      data.status = true;
      return res.statusJson(200, { data: data });
    } catch (error) {
      console.log(error);
      data["error"] = error;
      return res.statusJson(500, { data: data });
    }
  }
  @get("/users")
  async getAllUsers(req: Request, res: Response) {
    let data: { status: boolean; users: User[] } = {
      status: false,
      users: [],
    };
    try {
      const users = await UserModel.find({});
      if (users.length === 0) {
        return res.statusJson(404, { data: data });
      }
      data.status = true;
      data.users = users;
      return res.statusJson(200, { data: data });
    } catch (error) {
      console.log(error);
      data["error"] = error;
      return res.statusJson(500, { data: data });
    }
  }
  @get("/users/:id")
  async getUser(req: Request, res: Response) {
    const { id } = req.params;
    let data: { status: boolean; message?: String; user?: User } = {
      status: false,
    };
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        data.message = "Invalid object id";
        return res.statusJson(400, { data: data });
      }
      const user = await UserModel.findOne({ id });
      if (!user) {
        data.message = "User not found";
        return res.statusJson(404, { data: data });
      }
      data.status = true;
      data.user = user;
      return res.statusJson(200, { data: data });
    } catch (error) {
      console.log(error);
      data["error"] = error;
      return res.statusJson(500, { data: data });
    }
  }
}

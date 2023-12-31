import mongoose from "mongoose";
import request from "supertest";
import { expect } from "chai";
import { app } from "../src/app";
import { IUser } from "src/modules/users/users.interface";
import url from "url";

export { expect, app, url, request };

export const UserModel = mongoose.model<IUser>("User");

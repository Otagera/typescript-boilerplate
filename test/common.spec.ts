import mongoose from "mongoose";
import request from "supertest";
import { expect } from "chai";
import { app } from "../src/app";
import { User } from "../src/interfaces";
import url from "url";

export { expect, app, url, request };

export const UserModel = mongoose.model<User>("User");
import mongoose from "mongoose";
import request from "supertest";
import { expect } from "chai";
import { app, base } from "../app";
import { User, Product, Order, Cart } from "../interfaces";
import url from "url";

export { expect, app, url, request };

export const UserModel = mongoose.model<User>("User");
export const ProductModel = base<Product>("product");
export const OrderModel = mongoose.model<Order>("Order");
export const CartModel = mongoose.model<Cart>("Cart");

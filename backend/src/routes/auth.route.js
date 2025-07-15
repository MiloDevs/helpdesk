import { eq } from "drizzle-orm";
import db from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usersModel from "../models/users.model.js";

async function login(req, reply) {
  const { name, password } = req.body;
  if (!name) {
    return reply.code(400).send({
      error: "missing name",
      message: "Please provide a valid name",
    });
  }

  if (!password) {
    return reply.code(400).send({
      error: "missing password",
      message: "Please provide a valid password",
    });
  }

  try {
    const user = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.name, name));
    if (user.length === 0) {
      return reply.code(404).send({
        error: "user not found",
        message: "No user found with the given username",
      });
    }
    const passMatch = await bcrypt.compare(password, user[0].password);
    if (!passMatch) {
      return reply.code(404).send({
        error: "invalid credentials",
        message: "Invalid username or password, please try again!",
      });
    }
    // sign jwt
    const token = jwt.sign(
      {
        username: name,
        role: user[0].role,
      },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );
    return reply.send({
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    return reply.code(404).send({
      error: "server error",
      message: "Something went wrong logging, please try again!",
    });
  }
}

export default function (fastify, opts, done) {
  fastify.post("/auth/login", login);
  done();
}

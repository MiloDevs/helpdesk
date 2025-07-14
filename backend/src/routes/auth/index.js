import { eq } from "drizzle-orm";
import db from "../../db/index.js";
import { usersTable } from "../../db/schema.js";
import bcrypt from "bcryptjs";

async function login(req, reply) {
  const { name, password } = req.body;
  if (!name) {
    console.log("this has sent");
    return reply.code(400).send({
      error: "missing name",
      message: "Please provide a valid name",
    });
  }

  if (!password) {
    console.log("this has sent");
    return reply.code(400).send({
      error: "missing password",
      message: "Please provide a valid password",
    });
  }

  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.name, name));
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
    return reply.send({
      user: user[0].id,
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

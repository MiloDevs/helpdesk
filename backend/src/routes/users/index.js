import crypto from "crypto";
import db from "../../db/index.js";
import { usersTable } from "../../db/schema.js";

async function handler(req, reply) {
  const { name } = req.body;
  if (!name) {
    reply
      .send({
        error: "missing name",
        message: "Please provide a valid name",
      })
      .code(400);
  }
  try {
    const user = {
      id: crypto.randomUUID(),
      name: name,
    };

    await db.insert(usersTable).values(user);

    reply.send({
      id: user.id,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    if (
      error.cause.message.includes(
        "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: users_table.name"
      )
    ) {
      reply
        .send({
          error: "duplicate username",
          message: "User with the given name already exists",
        })
        .code(400);
    }
    return Response.json({
      error: "server error",
      message: "Something went wrong creating your issue, please try again!",
    }).code(500);
  }
}

export default function (fastify, opts, done) {
  fastify.post("/user", handler);
  done();
}

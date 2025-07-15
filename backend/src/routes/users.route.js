import crypto, { randomBytes } from "crypto";
import db from "../db/index.js";
import usersModel from "../models/users.model.js";
import bcrypt from "bcryptjs";

async function createUser(req, reply) {
  const { name } = req.body;
  if (!name) {
    return reply.code(400).send({
      error: "missing name",
      message: "Please provide a valid name",
    });
  }
  try {
    const genPassword = randomBytes(12).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashGenPasswrd = await bcrypt.hash(genPassword, salt);
    const user = {
      id: crypto.randomUUID(),
      name: name,
      password: hashGenPasswrd,
    };

    await db.insert(usersModel).values(user);

    return reply.send({
      id: user.id,
      password: genPassword,
      message: "User created successfully",
    });
  } catch (error) {
    if (
      error.cause.message.includes(
        "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: users_table.name"
      )
    ) {
      return reply.code(400).send({
        error: "duplicate username",
        message: "User with the given name already exists",
      });
    }
    return reply.code(500).send({
      error: "server error",
      message: "Something went wrong creating your user, please try again!",
    });
  }
}

async function getUserIssues(req, reply) {
  const { userId } = req.params;
  if (!userId) {
    return reply.code(400).send({
      error: "missing userId",
      message: "Please provide a valid userId",
    });
  }
  try {
    const issues = await db.query.issuesTable.findMany({
      where: (issue, { eq }) => eq(issue.assigneeId, userId),
    });

    return reply.send(issues);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      error: "server error",
      message: "Something went wrong retreiving your issues, please try again!",
    });
  }
}

async function getDevideId(req, reply) {
  const uuid = crypto.randomUUID();
  return reply.send({
    id: uuid,
  });
}

export default function (fastify, opts, done) {
  fastify.post("/user", createUser);
  fastify.get("/user/issues/:userId", getUserIssues);
  fastify.get("/uuid", getDevideId);
  done();
}

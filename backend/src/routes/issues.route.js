import { eq } from "drizzle-orm";
import db from "../db/index.js";
import issuesModel from "../models/issues.model.js";
import usersModel from "../models/users.model.js";

async function createIssueHandler(req, reply) {
  const { reporter_name, office_number, issue_description } = req.body;
  if (!reporter_name) {
    return reply.code(400).send({
      error: "missing reporter_name",
      message: "Please provide a valid Reporter Name",
    });
  }
  if (!office_number) {
    return reply.code(400).send({
      error: "missing office_number",
      message: "Please provide a valid Office Number",
    });
  }
  if (!issue_description) {
    return reply.code(400).send({
      error: "missing issue_description",
      message: "Please provide a valid Issue Description",
    });
  }

  try {
    // insert to db
    const issue = {
      id: crypto.randomUUID(),
      issueDescription: issue_description,
      officeNumber: office_number,
      reporterName: reporter_name,
    };

    await db.insert(issuesModel).values(issue);

    return reply.send({
      id: issue.id,
      message: "Issue recorded successfully",
    });
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      error: "server error",
      message: "Something went wrong creating your issue, please try again!",
    });
  }
}

export async function getIssueHandler(req, reply) {
  const { id } = req.params;
  if (!id) {
    return reply.code(400).send({
      error: true,
      message: "Please provide a valid id",
    });
  } else {
    try {
      const issue = await db
        .select()
        .from(issuesModel)
        .where(eq(issuesModel.id, id));
      if (!issue[0]) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      console.log(issue);
      return reply.send(issue[0]);
    } catch (error) {
      console.log(error);
      if (error.cause?.message.includes("SQLITE_ERROR: no such column")) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      return reply.code(500).send({
        error: true,
        message:
          "Something went wrong retrieving your issue, please try again!",
      });
    }
  }
}

export async function updateIssueHandler(req, reply) {
  const { id } = req.params;
  const {
    reporter_name,
    status,
    office_number,
    issue_description,
    assignee_id,
  } = req.body;
  if (!id) {
    return reply.code(400).send({
      error: "missing id",
      message: "Please provide a valid id",
    });
  } else {
    try {
      const issue = await db
        .update(issuesModel)
        .set({
          reporterName: reporter_name,
          officeNumber: office_number,
          status: status,
          assigneeId: assignee_id,
          issueDescription: issue_description,
        })
        .where(eq(issuesModel.id, id))
        .returning({ updatedId: issuesModel.id });
      if (!issue[0]) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      console.log(issue);
      return reply.send(issue[0]);
    } catch (error) {
      console.log(error.cause.message);
      if (error.cause.message.includes("SQLITE_ERROR: no such column")) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      return reply.code(404).send({
        error: "server error",
        message:
          "Something went wrong retrieving your issue, please try again!",
      });
    }
  }
}

export async function deleteIssueHandler(req, reply) {
  const { id } = req.params;
  if (!id) {
    return reply.code(400).send({
      error: "missing id",
      message: "Please provide a valid id",
    });
  } else {
    try {
      const issue = await db.delete(issuesModel).where(eq(issuesModel.id, id));
      if (issue.rowsAffected === 0) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      console.log(issue);
      return reply.send({
        message: "Issue deleted successfully",
      });
    } catch (error) {
      console.log(error);
      if (error.cause.message.includes("SQLITE_ERROR: no such column")) {
        return reply.code(404).send({
          error: "issue not found",
          message: "No issue found with given id",
        });
      }
      return reply.code(500).send({
        error: "server error",
        message: "Something went wrong deleting your issue, please try again!",
      });
    }
  }
}

export async function assignIssueHandler(req, reply) {
  const { issueId, userId } = req.params;
  if (!userId) {
    return reply.code(400).send({
      error: "missing user_id",
      message: "Please provide an assignee id",
    });
  }
  if (!issueId) {
    return reply.code(400).send({
      error: "missing issue_id",
      message: "Please provide an issue id",
    });
  }

  try {
    const user = db.select().from(usersModel).where(eq(usersModel.id, userId));

    const issue = await db
      .update(issuesModel)
      .set({ assigneeId: userId })
      .where(eq(issuesModel.id, issueId))
      .returning({ id: issuesModel.id });

    return reply.send({
      id: issue[0].id,
      message: "Task assigned successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.cause?.message.includes("SQLITE_ERROR: no such column")) {
      return reply.code(404).send({
        error: "issue not found",
        message: "No issue found with given id",
      });
    }
    return reply.code(500).send({
      error: "server error",
      message: "Something went wrong creating your issue, please try again!",
    });
  }
}

export default function (fastify, opts, done) {
  fastify.post("/issue", createIssueHandler);
  fastify.get("/issue/:id", getIssueHandler);
  fastify.put("/issue/:id", updateIssueHandler);
  fastify.delete("/issue/:id", deleteIssueHandler);
  fastify.get("/issue/assign/:issueId/:userId", assignIssueHandler);
  done();
}

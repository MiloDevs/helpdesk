import { eq } from "drizzle-orm";
import db from "../../db/index.js";
import { issuesTable, usersTable } from "../../db/schema.js";

async function createIssueHandler(req, reply) {
  const { reporter_name, office_number, issue_description } = req.body;
  if (!reporter_name) {
    reply
      .send({
        error: "missing reporter_name",
        message: "Please provide a valid Reporter Name",
      })
      .code(400);
  }
  if (!office_number) {
    reply
      .send({
        error: "missing office_number",
        message: "Please provide a valid Office Number",
      })
      .code(400);
  }
  if (!issue_description) {
    reply
      .send({
        error: "missing issue_description",
        message: "Please provide a valid Issue Description",
      })
      .code(400);
  }

  try {
    // insert to db
    const issue = {
      id: crypto.randomUUID(),
      issueDescription: issue_description,
      officeNumber: office_number,
      reporterName: reporter_name,
    };

    await db.insert(issuesTable).values(issue);

    reply.send({
      id: issue.id,
      message: "Issue recorded successfully",
    });
  } catch (error) {
    console.log(error);
    reply
      .send({
        error: "server error",
        message: "Something went wrong creating your issue, please try again!",
      })
      .code(500);
  }
}

export async function getIssueHandler(req, reply) {
  const { id } = req.params;
  if (!id) {
    reply
      .send({
        error: true,
        message: "Please provide a valid id",
      })
      .code(400);
  } else {
    try {
      const issue = await db
        .select()
        .from(issuesTable)
        .where(eq(issuesTable.id, id));
      if (!issue[0]) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      console.log(issue);
      reply.send(issue[0]);
    } catch (error) {
      console.log(error);
      if (error.cause?.message.includes("SQLITE_ERROR: no such column")) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      reply
        .send({
          error: true,
          message:
            "Something went wrong retrieving your issue, please try again!",
        })
        .code(500);
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
    reply
      .send({
        error: "missing id",
        message: "Please provide a valid id",
      })
      .code(400);
  } else {
    try {
      const issue = await db
        .update(issuesTable)
        .set({
          reporterName: reporter_name,
          officeNumber: office_number,
          status: status,
          assigneeId: assignee_id,
          issueDescription: issue_description,
        })
        .where(eq(issuesTable.id, id))
        .returning({ updatedId: issuesTable.id });
      if (!issue[0]) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      console.log(issue);
      reply.send(issue[0]);
    } catch (error) {
      console.log(error.cause.message);
      if (error.cause.message.includes("SQLITE_ERROR: no such column")) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      reply
        .send({
          error: "server error",
          message:
            "Something went wrong retrieving your issue, please try again!",
        })
        .code(404);
    }
  }
}

export async function deleteIssueHandler(req, reply) {
  const { id } = req.params;
  if (!id) {
    reply
      .send({
        error: "missing id",
        message: "Please provide a valid id",
      })
      .code(400);
  } else {
    try {
      const issue = await db.delete(issuesTable).where(eq(issuesTable.id, id));
      if (issue.rowsAffected === 0) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      console.log(issue);
      reply.send({
        message: "Issue deleted successfully",
      });
    } catch (error) {
      console.log(error);
      if (error.cause.message.includes("SQLITE_ERROR: no such column")) {
        reply
          .send({
            error: "issue not found",
            message: "No issue found with given id",
          })
          .code(404);
      }
      reply
        .send({
          error: "server error",
          message:
            "Something went wrong deleting your issue, please try again!",
        })
        .code(500);
    }
  }
}

export async function assignIssueHandler(req, reply) {
  const { issueId, userId } = req.params;
  if (!userId) {
    reply.send(
      {
        error: "missing user_id",
        message: "Please provide an assignee id",
      },
      {
        status: 400,
      }
    );
  }
  if (!issueId) {
    reply.send(
      {
        error: "missing issue_id",
        message: "Please provide an issue id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const user = db.select().from(usersTable).where(eq(usersTable.id, userId));

    const issue = await db
      .update(issuesTable)
      .set({ assigneeId: userId })
      .where(eq(issuesTable.id, issueId))
      .returning({ id: issuesTable.id });

    reply.send({
      id: issue[0].id,
      message: "Task assigned successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.cause?.message.includes("SQLITE_ERROR: no such column")) {
      reply
        .send({
          error: "issue not found",
          message: "No issue found with given id",
        })
        .code(404);
    }
    reply
      .send({
        error: "server error",
        message: "Something went wrong creating your issue, please try again!",
      })
      .code(500);
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

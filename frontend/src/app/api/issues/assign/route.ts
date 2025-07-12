import db from "@/db";
import { issuesTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const { assignee_id, issue_id } = body;
  if (!assignee_id) {
    return Response.json(
      {
        error: true,
        reason: "missing assignee_id",
        message: "Please provide an assignee id",
      },
      {
        status: 400,
      }
    );
  }
  if (!issue_id) {
    return Response.json(
      {
        error: true,
        reason: "missing issue_id",
        message: "Please provide an issue id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const user = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, assignee_id));

    const issue = await db
      .update(issuesTable)
      .set({ assigneeId: assignee_id })
      .where(eq(issuesTable.id, issue_id))
      .returning({ id: issuesTable.id });

    return Response.json({
      error: false,
      id: issue[0].id,
      message: "Task assigned successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.cause.message.includes("SQLITE_ERROR: no such column")) {
      return Response.json(
        {
          error: true,
          message: "No issue found with given id",
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        error: false,
        message: "Something went wrong creating your issue, please try again!",
      },
      {
        status: 500,
      }
    );
  }
}

import db from "@/db";
import { issuesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return Response.json(
      {
        error: true,
        message: "Please provide a valid id",
      },
      {
        status: 404,
      }
    );
  } else {
    try {
      const issue = await db
        .select()
        .from(issuesTable)
        .where(eq(issuesTable.id, id));
      if (!issue[0]) {
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
      console.log(issue);
      return Response.json(issue[0]);
    } catch (error) {
      console.log(error.cause.message);
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
          error: true,
          message:
            "Something went wrong retrieving your issue, please try again!",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await req.json();
  const {
    reporter_name,
    status,
    office_number,
    issue_description,
    assignee_id,
  } = body;
  if (!id) {
    return Response.json(
      {
        error: true,
        message: "Please provide a valid id",
      },
      {
        status: 404,
      }
    );
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
      console.log(issue);
      return Response.json(issue[0]);
    } catch (error) {
      console.log(error.cause.message);
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
          error: true,
          message:
            "Something went wrong retrieving your issue, please try again!",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return Response.json(
      {
        message: "Please provide a valid id",
      },
      {
        status: 404,
      }
    );
  } else {
    try {
      const issue = await db.delete(issuesTable).where(eq(issuesTable.id, id));
      if (issue.rowsAffected === 0) {
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
      console.log(issue);
      return Response.json(issue);
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
          error: true,
          message:
            "Something went wrong deleting your issue, please try again!",
        },
        {
          status: 500,
        }
      );
    }
  }
}

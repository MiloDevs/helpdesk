import db from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id) {
    return Response.json(
      {
        error: true,
        reason: "missing id",
        message: "Please provide a valid user id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const issues = await db.query.usersTable.findMany({
      with: {
        issues: true,
      },
      where: eq(usersTable.id, id),
    });

    return Response.json(issues[0]);
  } catch (error) {
    console.log(error);
    if (
      error.cause.message.includes(
        "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: users_table.name"
      )
    ) {
      return Response.json(
        {
          error: true,
          message: "User with the given name already exists",
        },
        {
          status: 400,
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

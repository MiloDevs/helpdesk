import db from "@/db";
import { usersTable } from "@/db/schema";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;
  if (!name) {
    return Response.json(
      {
        error: true,
        reason: "missing name",
        message: "Please provide a user name",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // insert to db
    const issue: typeof usersTable.$inferInsert = {
      id: crypto.randomUUID(),
      name: name,
    };

    await db.insert(usersTable).values(issue);

    return Response.json({
      error: false,
      id: issue.id,
      message: "User created successfully",
    });
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

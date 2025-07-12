import db from "@/db";
import { issuesTable } from "@/db/schema";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { reporter_name, office_number, issue_description } = body;
  if (!reporter_name) {
    return Response.json(
      {
        error: true,
        reason: "missing reporter_name",
        message: "Please provide a valid Reporter Name",
      },
      {
        status: 400,
      }
    );
  }
  if (!office_number) {
    return Response.json(
      {
        error: true,
        reason: "missing office_number",
        message: "Please provide a valid Office Number",
      },
      {
        status: 400,
      }
    );
  }
  if (!issue_description) {
    return Response.json(
      {
        error: true,
        reason: "missing issue_description",
        message: "Please provide a valid Issue Description",
      },
      {
        status: 500,
      }
    );
  }

  try {
    // insert to db
    const issue: typeof issuesTable.$inferInsert = {
      id: crypto.randomUUID(),
      issueDescription: issue_description,
      officeNumber: office_number,
      reporterName: reporter_name,
    };

    await db.insert(issuesTable).values(issue);

    return Response.json({
      error: false,
      id: issue.id,
      message: "Issue recorded successfully",
    });
  } catch (error) {
    console.log(error);
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

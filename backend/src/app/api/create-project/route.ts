import { getAuth } from "@clerk/nextjs/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase";
import { CreateProjectResponse } from "@roomspark/shared";
import { Project } from "@roomspark/shared/src/types/objects";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Check if the user is authenticated via Clerk
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as CreateProjectResponse,
        { status: 401 }
      );
    }

    // Get the request body
    const { name } = await request.json();

    let projectName = name;
    if (!projectName) {
      const { count, error: countError } = await supabase
        .from("user_projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Error counting projects:", countError);
        projectName = "Project";
      } else {
        projectName = `Project ${(count || 0) + 1}`;
      }
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("user_projects")
      .insert([
        {
          name: projectName,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (projectError) {
      console.error("Error creating project:", projectError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to create project",
        } as CreateProjectResponse,
        { status: 500 }
      );
    }

    const formattedProject: Project = {
      id: project.id,
      name: project.name || "",
      image: "",
      created_at: project.created_at,
    };

    const response: CreateProjectResponse = {
      status: "success",
      project: formattedProject,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in create-project route:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as CreateProjectResponse,
      { status: 500 }
    );
  }
}

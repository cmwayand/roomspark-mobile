import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../../../lib/supabase";
import { GetProjectsResponse } from "@roomspark/shared";
import { Project } from "@roomspark/shared/src/types/objects";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);

    // Get the current user from Clerk
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as GetProjectsResponse,
        { status: 401 }
      );
    }

    // Get all projects for the user
    const { data: projects, error: projectsError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch projects",
        } as GetProjectsResponse,
        { status: 500 }
      );
    }

    const { data: generatedImages, error: generatedImagesError } =
      await supabase
        .from("user_generated")
        .select("*")
        .eq("user_id", userId)
        .in(
          "project_id",
          projects.map((project) => project.id)
        );

    if (generatedImagesError) {
      console.error("Error fetching generated images:", generatedImagesError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch generated images",
        } as GetProjectsResponse,
        { status: 500 }
      );
    }

    const generatedImagesMap = new Map<string, any[]>();
    generatedImages?.forEach((image) => {
      if (!image.project_id) {
        return;
      }
      if (!generatedImagesMap.has(image.project_id)) {
        generatedImagesMap.set(image.project_id, []);
      }
      generatedImagesMap.get(image.project_id)?.push(image);
    });

    const formattedProjects: Project[] = projects.map((project) => ({
      id: project.id,
      name: project.name ?? "",
      image: generatedImagesMap.get(project.id)?.[0]?.file_url ?? "",
      created_at: project.created_at,
    }));

    return NextResponse.json(
      {
        status: "success",
        projects: formattedProjects,
      } as GetProjectsResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in get-projects route:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as GetProjectsResponse,
      { status: 500 }
    );
  }
}

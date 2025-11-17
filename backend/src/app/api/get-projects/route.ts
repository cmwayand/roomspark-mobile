import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { GetProjectsResponse } from "@roomspark/shared";
import { Project } from "@roomspark/shared/src/types/objects";
import { getUserIdFromRequest } from "@/src/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    let userId: string;
    try {
      userId = getUserIdFromRequest(request);
    } catch (authError: any) {
      console.error("🔐 GET-PROJECTS - Auth error:", authError);
      return NextResponse.json(
        {
          status: "error",
          error: "Unauthorized: " + authError.message,
        } as GetProjectsResponse,
        { status: 401 }
      );
    }

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

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        {
          status: "success",
          projects: [],
        } as GetProjectsResponse,
        { status: 200 }
      );
    }

    // Get generated images for these projects
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

    // Create a map of project_id to images
    const generatedImagesMap = new Map<string, any[]>();
    generatedImages?.forEach((image) => {
      if (!image.project_id) {
        return;
      }
      if (!generatedImagesMap.has(image.project_id?.toString())) {
        generatedImagesMap.set(image.project_id?.toString(), []);
      }
      generatedImagesMap.get(image.project_id?.toString())?.push(image);
    });

    // Format the projects with their images
    const formattedProjects: Project[] = projects.map((project) => ({
      id: project.id,
      name: project.name ?? "",
      image:
        generatedImagesMap.get(project.id?.toString())?.[0]?.file_url ?? "",
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

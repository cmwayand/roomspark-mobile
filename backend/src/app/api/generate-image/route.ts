import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { ServiceFactory } from "@/src/factories/serviceFactory";
import { RoomTypePrompt } from "@/src/prompts/RoomTypePrompt";

import { GenerateImageResponse, RoomType } from "@roomspark/shared";
import { getUserIdFromRequest } from "@/src/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk
    let userId: string;
    userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as GenerateImageResponse,
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { imageId, projectId, roomType = RoomType.GENERIC } = body;

    if (!imageId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Image ID is required",
        } as GenerateImageResponse,
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Project ID is required",
        } as GenerateImageResponse,
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from("user_projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid project ID or unauthorized",
        } as GenerateImageResponse,
        { status: 403 }
      );
    }

    // Validate the file ID belongs to the user and project
    const { data: upload, error: uploadError } = await supabase
      .from("user_uploads")
      .select("file_path, file_url")
      .eq("id", imageId) //TODO change fileId to a GUID....
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        {
          status: "error",
          error: "File not found or you don't have permission to access it",
        } as GenerateImageResponse,
        { status: 404 }
      );
    }

    // Get the image generation service from the factory
    const imageGenerationService =
      ServiceFactory.getImageGenerationService(supabase);

    // Generate the appropriate prompt based on room type
    const prompt = RoomTypePrompt.generatePrompt(roomType);

    // Call the image generation service with the file URL from the database
    const result = await imageGenerationService.generateImage(
      {
        imageUrl: upload.file_url,
        prompt,
      },
      userId,
      projectId
    );

    if (!result.success) {
      return NextResponse.json(
        { status: "error", error: result.error } as GenerateImageResponse,
        { status: 500 }
      );
    }

    if (!result.imageUrl) {
      return NextResponse.json(
        {
          status: "error",
          error: "Image URL was not returned from generation servce",
        } as GenerateImageResponse,
        { status: 500 }
      );
    }

    const response: GenerateImageResponse = {
      status: "success",
      imageUrl: result.imageUrl,
      imageId: result.imageId,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as GenerateImageResponse,
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { ImageProcessor } from "../../../utils/imageProcessor";
import { getAuth } from "@clerk/nextjs/server";
import { UploadResponse } from "@roomspark/shared";

// 20MB in bytes
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the JSON request body
    const { photo, filename, fileType, projectId } = await request.json();

    if (!photo) {
      return NextResponse.json(
        { status: "error", error: "Photo is required" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { status: "error", error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Decode the base64 image
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { status: "error", error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    console.log(
      "File size before processing: ",
      buffer.length / 1024 / 1024 + "MB"
    );

    const processedImage = await ImageProcessor.processImage(buffer, {
      width: 1024,
      format: "png",
      quality: 100,
    });

    console.log(
      "File size after processing: ",
      processedImage.buffer.length / 1024 / 1024 + "MB"
    );

    // Generate a unique file name using UUID
    const uniqueFileName = `${uuidv4()}.png`;
    const filePath = `photos/${uniqueFileName}`;

    // Initialize Supabase client
    const supabase = createServerSupabaseClient(request);

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
        } as UploadResponse,
        { status: 403 }
      );
    }

    //TODO use new upload service for this....
    // Upload processed file to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("user-uploads")
      .upload(filePath, processedImage.buffer, {
        contentType: "image/png",
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to upload file",
        } as UploadResponse,
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from("user-uploads")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 100); // 100 years expiry

    if (signedUrlError) {
      console.error("Signed URL generation error:", signedUrlError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to generate file URL",
        } as UploadResponse,
        { status: 500 }
      );
    }

    const fileUrl = urlData.signedUrl;

    // Insert the new upload record with file information
    try {
      const { data, error } = await supabase
        .from("user_uploads")
        .insert([
          {
            file_path: filePath,
            file_url: fileUrl,
            file_type: "image/png",
            file_size: processedImage.buffer.length,
            project_id: projectId,
            user_id: userId,
            blur_hash: processedImage.blurhash,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error inserting upload:", error);
        return NextResponse.json(
          {
            status: "error",
            error: "Failed to create upload record",
          } as UploadResponse,
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          status: "success",
          imageId: data.id,
          imageUrl: fileUrl,
          blurhash: processedImage.blurhash,
        } as UploadResponse,
        { status: 200 }
      );
    } catch (supabaseError) {
      console.error("Supabase operation error:", supabaseError);
      return NextResponse.json(
        {
          status: "error",
          error: "Database operation failed",
        } as UploadResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      } as UploadResponse,
      { status: 500 }
    );
  }
}

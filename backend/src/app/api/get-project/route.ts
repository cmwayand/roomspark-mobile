import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { GetProjectDetailsResponse } from "@roomspark/shared";
import { ProjectImage, Product } from "@roomspark/shared/src/types/objects";
import { getUserIdFromRequest } from "@/src/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk
    let userId: string;
    userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as GetProjectDetailsResponse,
        { status: 401 }
      );
    }

    // Get projectId from URL search params
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Project ID is required",
        } as GetProjectDetailsResponse,
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get the project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid project ID or unauthorized",
        } as GetProjectDetailsResponse,
        { status: 403 }
      );
    }

    // Get all user uploads for this project
    const { data: uploads, error: uploadsError } = await supabase
      .from("user_uploads")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (uploadsError) {
      console.error("Error fetching uploads:", uploadsError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch uploads",
        } as GetProjectDetailsResponse,
        { status: 500 }
      );
    }

    // Get all generated images for this project
    const { data: generated, error: generatedError } = await supabase
      .from("user_generated")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (generatedError) {
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch generated images",
        } as GetProjectDetailsResponse,
        { status: 500 }
      );
    }

    // Get all products for this project
    const { data: products, error: productsError } = await supabase
      .from("user_products")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch products",
        } as GetProjectDetailsResponse,
        { status: 500 }
      );
    }

    const formattedUploads: ProjectImage[] = uploads.map((upload) => ({
      id: upload.id,
      url: upload.file_url,
      type: "upload",
      created_at: upload.created_at,
      source: "upload", // hardcode to source, as this column is really only useful for user_generated images
      blurhash: upload.blur_hash ?? undefined,
    }));

    const formattedGenerated: ProjectImage[] = generated.map((gen) => ({
      id: gen.id,
      url: gen.file_url,
      type: "generated",
      created_at: gen.created_at,
      source: gen.source ?? "",
      blurhash: gen.blur_hash ?? undefined,
    }));
    const formattedProducts: Product[] = products.map((product) => ({
      id: product.id,
      title: product.title ?? "",
      price: product.price_value
        ? {
            currency: product.price_currency ?? "",
            value: product.price_value,
          }
        : undefined,
      link: product.link ?? "",
      image: product.image ?? "",
      description: product.description ?? "",
      created_at: product.created_at,
      liked: product.liked,
      inStock: product.in_stock,
      isAffiliate: product.is_affiliate,
      source: product.source ?? "",
    }));

    const imageToUse =
      formattedUploads.length > 0
        ? formattedUploads[0]
        : formattedGenerated.length > 0
        ? formattedGenerated[0]
        : null;

    const response: GetProjectDetailsResponse = {
      status: "success",
      project: {
        id: project.id,
        name: project.name ?? "",
        image: imageToUse?.url ?? "",
        created_at: project.created_at,
      },
      uploads: formattedUploads,
      generated: formattedGenerated,
      products: formattedProducts,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Get project error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as GetProjectDetailsResponse,
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

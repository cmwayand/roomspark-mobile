import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { LikeProductResponse } from "@roomspark/shared";
import { getUserIdFromRequest } from "@/src/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk
    let userId: string;
    userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as LikeProductResponse,
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { productId, liked } = body;

    if (!productId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Product ID is required",
        } as LikeProductResponse,
        { status: 400 }
      );
    }

    if (typeof liked !== "boolean") {
      return NextResponse.json(
        {
          status: "error",
          error: "Liked value must be a boolean",
        } as LikeProductResponse,
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    // First check if the product exists and belongs to the user
    const { data: existingProduct, error: fetchError } = await supabase
      .from("user_products")
      .select("id")
      .eq("id", productId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        {
          status: "error",
          error: "Product not found or you don't have permission to like it",
        } as LikeProductResponse,
        { status: 404 }
      );
    }

    // Update the liked column to true
    const { error: updateError } = await supabase
      .from("user_products")
      .update({ liked: liked })
      .eq("id", productId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating product like status:", updateError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to like product",
        } as LikeProductResponse,
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        status: "success",
        productId: productId,
      } as LikeProductResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Like product error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as LikeProductResponse,
      { status: 500 }
    );
  }
}

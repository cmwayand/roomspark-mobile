import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { GetLikedProductsResponse } from "@roomspark/shared";
import { Product } from "@roomspark/shared/src/types/objects";
import { getUserIdFromRequest } from "@/src/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk
    let userId: string;
    userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as GetLikedProductsResponse,
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    // Fetch all liked products for the current user
    const { data: likedProducts, error: fetchError } = await supabase
      .from("user_products")
      .select("*")
      .eq("user_id", userId)
      .eq("liked", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching liked products:", fetchError);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch liked products",
        } as GetLikedProductsResponse,
        { status: 500 }
      );
    }

    // Format the products to match the Product interface
    const formattedProducts: Product[] = likedProducts.map((product) => ({
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
      liked: product.liked,
      inStock: product.in_stock,
      source: product.source ?? "",
      isAffiliate: product.is_affiliate,
    }));

    // Return the liked products
    return NextResponse.json(
      {
        status: "success",
        products: formattedProducts,
      } as GetLikedProductsResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get liked products error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as GetLikedProductsResponse,
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

import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/src/factories/serviceFactory";
import { AffiliateService } from "@/src/services/affiliate/affiliateService";
import { ProductProcessorService } from "@/src/services/products/productProcessorService";
import { createServerSupabaseClient } from "@/src/lib/supabase-server";
import { GetProductsResponse } from "@roomspark/shared";
import { getUserIdFromRequest } from "@/src/utils/auth";

// Initialize the affiliate service
const affiliateService = new AffiliateService({
  amazon: {
    tag: process.env.AMAZON_AFFILIATE_TAG || "",
  },
});

// Initialize the product processor service
const productProcessorService = new ProductProcessorService({
  amazonPriority: true,
  titleCleaning: true,
});

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated via Clerk

    // Get the current user from JWT token
    let userId: string;
    userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { status: "error", error: "Unauthorized" } as GetProductsResponse,
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { imageId, projectId } = body;

    if (!imageId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Image ID is required",
        } as GetProductsResponse,
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Project ID is required",
        } as GetProductsResponse,
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    // Fetch the image URL from the database using the image ID
    const { data: generatedImage, error: fetchError } = await supabase
      .from("user_generated")
      .select("file_url")
      .eq("id", imageId)
      .eq("project_id", projectId)
      .eq("user_id", userId) // Ensure the image belongs to the user
      .single();

    if (fetchError || !generatedImage) {
      return NextResponse.json(
        {
          status: "error",
          error: "Image not found or you don't have permission to access it",
        } as GetProductsResponse,
        { status: 404 }
      );
    }

    const imageUrl = generatedImage.file_url;
    const productService = ServiceFactory.getProductService();

    const products = await productService.getProductsFromImage(imageUrl);
    const productsWithAffiliateLinks =
      affiliateService.convertProductLinks(products);
    const processedProducts = productProcessorService.processProducts(
      productsWithAffiliateLinks
    );

    // Save the products to the DB
    const { error: saveError } = await supabase.from("user_products").insert(
      processedProducts.map((product) => {
        return {
          id: product.id,
          user_id: userId,
          project_id: projectId,
          title: product.title,
          price_currency: product.price?.currency,
          price_value: parseInt(product.price?.value as string),
          link: product.link,
          image: product.image,
          description: product.description,
          in_stock: product.inStock ?? false,
          source: product.source ?? "",
          is_affiliate: product.isAffiliate,
        };
      })
    );

    if (saveError) {
      console.error("Error saving products:", saveError);
    }

    // Return the products
    return NextResponse.json(
      {
        status: "success",
        products: productsWithAffiliateLinks,
      } as GetProductsResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Internal server error",
      } as GetProductsResponse,
      { status: 500 }
    );
  }
}

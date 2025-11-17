import { ProductService } from "../../interfaces/productService";
import { Product } from "@roomspark/shared/src/types/objects";
import { randomUUID } from "crypto";

export class MockProductService implements ProductService {
  getProductsByAmazonSearch(
    description: string[],
    projectId: string,
    userId: string
  ): Promise<Product[]> {
    throw new Error("Method not implemented.");
  }
  async getProductsFromImage(imageUrl: string): Promise<Product[]> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return mock product data based on real SerpAPI results
    const mockProducts: Product[] = [
      {
        id: randomUUID(),
        title:
          "3-Tier End Table with USB Ports and Outlets, Sofa Table for Small Space - Bed Bath & Beyond - 40768986",
        link: "https://www.bedbathandbeyond.com/Home-Garden/3-Tier-End-Table-with-USB-Ports-and-Outlets-Sofa-Table-for-Small-Space/40768986/product.html",
        image:
          "https://ak1.ostkcdn.com/images/products/is/images/direct/030e273800199eaf73b83441566aff960a710041/3-Tier-End-Table-with-USB-Ports-and-Outlets,-Sofa-Table-for-Small-Space.jpg?impolicy=medium",
        description:
          "Bed Bath & Beyond - 3-Tier End Table with USB Ports and Outlets",
        liked: false,
        inStock: false,
        isAffiliate: false,
        source: "Bed Bath & Beyond",
      },
      {
        id: randomUUID(),
        title:
          "BYBLIGHT Kerlin 23.62 in. Rustic Brown & Black Rectangular Wood End Table, 2-Tier Side Tables with Metal Frame for Home, 2 Pcs BB-RY0166YFx2 - The Home Depot",
        price: {
          value: 170,
          currency: "$",
        },
        link: "https://www.homedepot.com/p/BYBLIGHT-Kerlin-23-62-in-Rustic-Brown-Black-Rectangular-Wood-End-Table-2-Tier-Side-Tables-with-Metal-Frame-for-Home-2-Pcs-BB-RY0166YFx2/332825066",
        image:
          "https://images.thdstatic.com/productImages/1498e0a9-9ab7-4cb7-b872-3d182683d3a1/svn/rustic-brown-black-byblight-end-side-tables-bb-ry0166yfx2-31_600.jpg",
        description:
          "The Home Depot - BYBLIGHT Kerlin Rustic Brown & Black Wood End Table",
        liked: false,
        inStock: false,
        isAffiliate: false,
        source: "The Home Depot",
      },
      {
        id: randomUUID(),
        title: "George Oliver Flinn 84'' Upholstered Sofa | Wayfair",
        price: {
          value: 1100,
          currency: "$",
        },
        link: "https://www.wayfair.com/furniture/pdp/george-oliver-flinn-84-square-arm-sofa-with-reversible-cushions-w001355366.html",
        image:
          "https://assets.wfcdn.com/im/50357273/resize-h380-w380^compr-r70/1579/157955275/default_name.jpg",
        description: "Wayfair - George Oliver Flinn 84'' Upholstered Sofa",
        liked: false,
        inStock: true,
        isAffiliate: false,
        source: "Wayfair",
      },
      {
        id: randomUUID(),
        title: "Uptown 96-Inch Sofa, Atenea Snow - Walmart.com",
        price: {
          value: 2304,
          currency: "$",
        },
        link: "https://www.walmart.com/ip/Uptown-96-Inch-Sofa-Atenea-Snow/5144555998",
        image:
          "https://i5.walmartimages.com/seo/Uptown-96-Inch-Sofa-Atenea-Snow_5d84eff2-5f8c-4481-9e24-66ba0f9bb9a1.8025bc20f000016fe26c0521efa5b13a.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
        description: "Walmart - Uptown 96-Inch Sofa, Atenea Snow",
        liked: false,
        inStock: true,
        isAffiliate: false,
        source: "Walmart",
      },
      {
        id: randomUUID(),
        title:
          "Mesa auxiliar, mesa auxiliar redonda para sala de estar, dormitorio, mesita de noche LED negra, juego de 2 con diseño de cuerda de cordel, mesa de centro de madera moderna de",
        link: "https://www.amazon.com/-/es/auxiliar-redonda-dormitorio-moderna-mediados/dp/B0DB8C1BZH",
        image:
          "https://m.media-amazon.com/images/I/81YYfWf2E6L._AC_UF894,1000_QL80_.jpg",
        description: "Amazon.com - Round Side Table with LED Design",
        liked: false,
        inStock: true,
        isAffiliate: true,
        source: "Amazon",
      },
    ];

    return mockProducts;
  }
}

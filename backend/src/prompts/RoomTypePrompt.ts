import { RoomType } from "@roomspark/shared";

export class RoomTypePrompt {
  private static readonly BASE_PROMPT =
    "Generate an image of this room but filled with furniture. Don't modify the walls/structure of the room, but you can put things on the walls and floor.";

  public static generatePrompt(roomType: RoomType): string {
    const basePrompt = this.BASE_PROMPT;

    switch (roomType) {
      case RoomType.MID_CENTURY_MODERN:
        return `${basePrompt} Style this space with Mid-Century Modern design featuring clean lines, tapered legs, warm wood tones, and pops of retro colors. Include minimalist furniture from the 1950s–60s with a futuristic twist. Focus on sleek geometric shapes and iconic pieces.`;

      case RoomType.SCANDINAVIAN:
        return `${basePrompt} Create a Scandinavian-style space with light, airy atmosphere using neutral tones, natural textures, and simple functionality. Feature light woods, cozy textiles, and minimal clutter. Emphasize hygge and understated elegance.`;

      case RoomType.INDUSTRIAL:
        return `${basePrompt} Design with Industrial style featuring exposed brick, metal pipes, concrete floors, and reclaimed wood. Create raw, unfinished textures that give it a warehouse or loft-like vibe. Include vintage industrial lighting and furniture.`;

      case RoomType.BOHEMIAN:
        return `${basePrompt} Style as Bohemian (Boho) with eclectic and layered design using bold colors, global patterns, and a mix of vintage and handmade items. Include plenty of plants, textiles, floor cushions, and relaxed furniture. Create a free-spirited, artistic atmosphere.`;

      case RoomType.MODERN_FARMHOUSE:
        return `${basePrompt} Create a Modern Farmhouse style with a cozy blend of rustic charm and modern polish. Use white walls, black accents, shiplap, distressed wood, and soft textures. Include vintage farmhouse elements with contemporary comfort.`;

      case RoomType.JAPANDI:
        return `${basePrompt} Design with Japandi style, a fusion of Japanese minimalism and Scandinavian coziness. Focus on clean lines, low furniture, natural elements, and serene neutral tones. Emphasize simplicity, functionality, and zen-like tranquility.`;

      case RoomType.TRADITIONAL:
        return `${basePrompt} Style with Traditional design featuring classic and elegant elements with symmetry, rich colors, ornate furniture, and timeless decor. Include crown moldings, antique-style pieces, layered drapes, and sophisticated details.`;

      case RoomType.CONTEMPORARY:
        return `${basePrompt} Create a Contemporary space with sleek and up-to-date design featuring smooth surfaces, neutral palettes, and geometric forms. Include open spaces, statement lighting, and current design trends with clean sophistication.`;

      case RoomType.COASTAL:
        return `${basePrompt} Design with Coastal style that's light, breezy, and inspired by the beach. Use whites, blues, natural fibers, and airy layouts for a relaxed seaside feel. Include nautical elements and weathered textures.`;

      case RoomType.ECLECTIC:
        return `${basePrompt} Style as Eclectic with bold and personal design that mixes different eras, colors, and textures in a curated yet cohesive way. No strict rules—just strong personality and creative combinations that tell a story.`;

      case RoomType.TRANSITIONAL:
        return `${basePrompt} Create a Transitional style with a balanced blend of traditional and contemporary elements. Use neutral colors, soft curves, and classic silhouettes with modern touches. Balance comfort with sophistication.`;

      case RoomType.GENERIC:
      default:
        return `${basePrompt} Add furniture with a sleek and modern design that would be appropriate for the space.`;
    }
  }
}

import { getFountainsWithRatings, sortByPopularity } from "../../../../lib/fountains";

// GET /api/fountains/popular
// The most popular water fountains ranked by average user rating.
const TOP_N = 6;

export async function GET() {
  const { fountains, source, error } = await getFountainsWithRatings();
  return Response.json({
    fountains: sortByPopularity(fountains).slice(0, TOP_N),
    source,
    error,
  });
}

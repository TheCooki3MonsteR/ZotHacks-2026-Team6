import { getFountainsWithRatings, sortByPopularity } from "../../../lib/fountains";

// GET /api/fountains
// Every UCI water fountain with coordinates and its global user rating.
export async function GET() {
  const { fountains, source, error } = await getFountainsWithRatings();
  return Response.json({ fountains: sortByPopularity(fountains), source, error });
}

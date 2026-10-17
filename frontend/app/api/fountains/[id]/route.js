import { getFountainsWithRatings } from "../../../../lib/fountains";

// GET /api/fountains/:id
// Full detail for one fountain, including its global rating. Reviews are loaded
// separately from the backend (/backend/fountains/:id/reviews). This is the "embedded URL" the map pop-up loads when a
// pin is clicked.
export async function GET(request, { params }) {
  const { id } = await params;
  const fountainId = Number(id);

  if (!Number.isFinite(fountainId)) {
    return Response.json({ error: "Invalid fountain id" }, { status: 400 });
  }

  const { fountains, source } = await getFountainsWithRatings();
  const fountain = fountains.find((f) => f.fountain_id === fountainId);

  if (!fountain) {
    return Response.json({ error: "Fountain not found" }, { status: 404 });
  }

  return Response.json({ fountain, source });
}

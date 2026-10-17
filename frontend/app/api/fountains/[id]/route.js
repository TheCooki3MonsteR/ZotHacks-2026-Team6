import {
  getFountainsWithRatings,
  getCommentsForFountain,
} from "../../../../lib/fountains";

// GET /api/fountains/:id
// Full detail for one fountain, including its global rating and the 4 most
// recent user comments. This is the "embedded URL" the map pop-up loads when a
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

  const { comments } = await getCommentsForFountain(fountainId);

  return Response.json({ fountain, comments, source });
}

import { redirect } from "next/navigation";

// The homepage lives at /homepage. The nav "Home" link points at "/", so route
// that here instead of showing a blank/placeholder page.
export default function Home() {
  redirect("/homepage");
}

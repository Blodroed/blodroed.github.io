import type { APIRoute } from "astro";
import { getProjects } from "../../lib/github-projects";

export const GET: APIRoute = async () => {
  try {
    const projects = await getProjects();

    return new Response(JSON.stringify(projects), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=28800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return new Response(JSON.stringify({ error: "Unable to load projects" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

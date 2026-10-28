import assert from "node:assert/strict";
import test from "node:test";
import { CACHE_DURATION_MS, createProjectsLoader } from "../src/lib/github-projects.ts";

const responseBody = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "example",
            description: "An example project",
            url: "https://github.com/blodroed/example",
            pushedAt: "2026-10-28T00:00:00Z",
            languages: { nodes: [{ name: "TypeScript" }] },
          },
        ],
      },
    },
  },
};

test("caches projects for eight hours and deduplicates concurrent requests", async () => {
  let currentTime = 0;
  let fetchCalls = 0;
  let resolveFetch: ((response: Response) => void) | undefined;

  const fetchImpl = () => {
    fetchCalls += 1;
    return new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
  };
  const getProjects = createProjectsLoader({
    fetchImpl,
    now: () => currentTime,
    token: "test-token",
  });

  const firstRequest = getProjects();
  const secondRequest = getProjects();
  assert.equal(fetchCalls, 1);

  resolveFetch?.(new Response(JSON.stringify(responseBody), { status: 200 }));
  const [firstProjects, secondProjects] = await Promise.all([firstRequest, secondRequest]);

  assert.deepEqual(firstProjects, secondProjects);
  assert.equal(fetchCalls, 1);

  currentTime = CACHE_DURATION_MS - 1;
  await getProjects();
  assert.equal(fetchCalls, 1);

  currentTime = CACHE_DURATION_MS;
  const refreshedRequest = getProjects();
  assert.equal(fetchCalls, 2);
  resolveFetch?.(new Response(JSON.stringify(responseBody), { status: 200 }));
  await refreshedRequest;
});

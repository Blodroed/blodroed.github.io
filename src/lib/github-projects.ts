const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const GITHUB_USERNAME = "blodroed";
export const CACHE_DURATION_MS = 8 * 60 * 60 * 1000;

export interface Project {
  name: string;
  description: string | null;
  html_url: string;
  pushedAt: string;
  languages: string[];
}

interface GitHubResponse {
  data?: {
    user?: {
      repositories?: {
        nodes?: Array<{
          name: string;
          description: string | null;
          url: string;
          pushedAt: string;
          languages?: {
            nodes?: Array<{ name: string }>;
          };
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const query = `
  query ($username: String!) {
    user(login: $username) {
      repositories(first: 100, privacy: PUBLIC, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          description
          url
          pushedAt
          languages(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

interface ProjectsLoaderOptions {
  fetchImpl?: typeof fetch;
  now?: () => number;
  token?: string;
}

export function createProjectsLoader({
  fetchImpl = fetch,
  now = Date.now,
  token = import.meta.env?.GITHUB_TOKEN,
}: ProjectsLoaderOptions = {}) {
  let cachedProjects: Project[] | null = null;
  let cacheExpiresAt = 0;
  let refreshPromise: Promise<Project[]> | null = null;

  async function fetchProjectsFromGitHub(): Promise<Project[]> {
    const response = await fetchImpl(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { username: GITHUB_USERNAME },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as GitHubResponse;
    if (result.errors?.length) {
      throw new Error(`GitHub GraphQL error: ${result.errors.map((error) => error.message).join(", ")}`);
    }

    const repositories = result.data?.user?.repositories?.nodes;
    if (!repositories) {
      throw new Error("GitHub returned an unexpected repository response");
    }

    return repositories.map((repo) => ({
      name: repo.name,
      description: repo.description,
      html_url: repo.url,
      pushedAt: repo.pushedAt,
      languages: repo.languages?.nodes?.map((language) => language.name) ?? [],
    }));
  }

  return async function getProjects(): Promise<Project[]> {
    if (cachedProjects && now() < cacheExpiresAt) {
      return cachedProjects;
    }

    if (!refreshPromise) {
      refreshPromise = fetchProjectsFromGitHub()
        .then((projects) => {
          cachedProjects = projects;
          cacheExpiresAt = now() + CACHE_DURATION_MS;
          return projects;
        })
        .catch((error) => {
          if (cachedProjects) {
            console.error("Failed to refresh GitHub projects; serving stale cache:", error);
            return cachedProjects;
          }
          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };
}

const getDefaultProjects = createProjectsLoader();

export function getProjects(): Promise<Project[]> {
  return getDefaultProjects();
}

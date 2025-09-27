interface Props {
  endpoint: string;
  query?: Record<string, string>;
  wrappedByKey?: string;
  wrappedByList?: boolean;
  page?: number;
  locale?: string;
}

/**
 * Fetches data from the Strapi API
 * @param endpoint - The endpoint to fetch from
 * @param query - The query parameters to add to the url
 * @param wrappedByKey - The key to unwrap the response from
 * @param wrappedByList - If the response is a list, unwrap it¨
 * @param page - If the response is paginated, which page to fetch
 * @param locale - The locale to fetch
 * @returns
 */
export default async function fetchApi<T>({
  endpoint,
  query,
  wrappedByKey,
  wrappedByList,
  page,
  locale
}: Props): Promise<T> {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }

  const url = new URL(`${import.meta.env.STRAPI_API_URL}/api/${endpoint}`);
  
  if (locale) {
    url.searchParams.append('locale', locale);
  }

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  if (page) {
    url.searchParams.append(`populate[${page}] [populate]`, '*');
  }

  // log the url
  console.log(`Fetching from Strapi: ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${import.meta.env.STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  let data = await res.json();

  console.log("Raw response from Strapi:", data);

  if (wrappedByKey) {
    data = data[wrappedByKey];
  }

  if (wrappedByList) {
    data = data[0];
  }

  if (page) {
    data = data[0]['attributes'][page];
  }

  return data;
}
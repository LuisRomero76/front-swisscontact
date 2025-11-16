export type ApiRoute = {
  _id: string;
  name: string;
  coordinates: number[][]; // [lon, lat][]
  assigned?: boolean;
};

export type GeoJsonFeature = {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'LineString';
    coordinates: number[][]; // [lon, lat][]
  };
};

export type GeoJson = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

export const routeColors = [
  '#e53935', '#d81b60', '#8e24aa', '#3949ab', '#1e88e5',
  '#039be5', '#00acc1', '#00897b', '#43a047', '#7cb342',
  '#fdd835', '#ffb300', '#fb8c00', '#f4511e', '#6d4c41'
];

// Función para convertir coordenadas [lon, lat] a [lat, lon]
export const convertCoordinates = (coords: number[][]): [number, number][] => {
  return coords.map(([lon, lat]) => [lat, lon]);
};

// Fetch routes from remote API and convert to GeoJSON FeatureCollection
export async function fetchRoutesFromApi(apiUrl = 'https://innovahack.onrender.com/api/routes'): Promise<GeoJson> {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Error fetching routes: ${res.status} ${res.statusText}`);
  }
  const data: ApiRoute[] = await res.json();

  const features: GeoJsonFeature[] = data.map((r) => ({
    type: 'Feature',
    properties: { id: r._id, name: r.name, assigned: !!r.assigned },
    geometry: {
      type: 'LineString',
      coordinates: r.coordinates,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

// Fetch raw routes array (keeps _id, name, assigned)
export async function fetchRoutesRaw(apiUrl = 'https://innovahack.onrender.com/api/routes'): Promise<ApiRoute[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Error fetching routes: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Assign a route to a user
export async function assignRoute(routeId: string, userId: string, apiUrl = 'https://innovahack.onrender.com/api/assignments'): Promise<any> {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route_id: routeId,
      user_id: userId,
    }),
  });
  if (!res.ok) {
    throw new Error(`Error assigning route: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Update route assigned status
export async function updateRouteAssignedStatus(routeId: string, assigned: boolean, apiUrl = 'https://innovahack.onrender.com/api/routes/'): Promise<any> {
  const res = await fetch(`${apiUrl}${routeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assigned,
    }),
  });
  if (!res.ok) {
    throw new Error(`Error updating route: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
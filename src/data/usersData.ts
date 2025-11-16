export type ApiUser = {
  _id: string;
  name: string;
  phone: number;
  rol: 'Recolector' | 'Admin' | string;
};

export type ApiAssignment = {
  _id: string;
  user_id: string;
  route_id: string;
  createdAt?: string;
};

// Fetch users from remote API
export async function fetchUsersFromApi(
  apiUrl = 'https://innovahack.onrender.com/api/users/'
): Promise<ApiUser[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Error fetching users: ${res.status} ${res.statusText}`);
  }
  const data: ApiUser[] = await res.json();
  return data;
}

// Fetch assignments from remote API
export async function fetchAssignmentsFromApi(
  apiUrl = 'https://innovahack.onrender.com/api/assignments/'
): Promise<ApiAssignment[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Error fetching assignments: ${res.status} ${res.statusText}`);
  }
  const data: ApiAssignment[] = await res.json();
  return data;
}

// Delete assignment from remote API
export async function deleteAssignmentFromApi(
  assignmentId: string,
  apiUrl = 'https://innovahack.onrender.com/api/assignments/'
): Promise<void> {
  const res = await fetch(`${apiUrl}${assignmentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Error deleting assignment: ${res.status} ${res.statusText}`);
  }
}

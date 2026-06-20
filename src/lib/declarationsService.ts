import { Declaration } from "../app/types";

const API_URL = 'http://localhost:3001/api';

export async function fetchDeclarations(userId: number): Promise<Declaration[]> {
  try {
    const response = await fetch(`${API_URL}/declarations?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching declarations:", error);
    return [];
  }
}

export async function upsertDeclarations(decls: Declaration[], userId: number): Promise<void> {
  if (!decls.length) return;
  try {
    const response = await fetch(`${API_URL}/declarations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ declarations: decls, userId }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error("Error saving declarations:", error);
    throw error;
  }
}

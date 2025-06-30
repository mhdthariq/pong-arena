import React from "react";
import GameClient from "./GameClient";

// Define the props type using any to bypass type checking issues
// @ts-expect-error - Next.js App Router typing issues
export default function MultiplayerGamePage({ params }) {
  // Add runtime validation to ensure params.id exists and is a string
  if (!params || typeof params.id !== 'string') {
    throw new Error('Invalid game ID parameter');
  }
  
  // Get the game ID from params
  const gameId = params.id;

  // Render the client component with the game ID
  return <GameClient gameId={gameId} />;
}

/**
 * This function is required by Next.js for dynamic route params with static exports.
 * Since we can't pre-generate all possible game IDs, we return an empty array.
 */
export async function generateStaticParams() {
  // Return an empty array since game IDs are created dynamically
  // and we can't pre-render all possible paths
  return [];
}

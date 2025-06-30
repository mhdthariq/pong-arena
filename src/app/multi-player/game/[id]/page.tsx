import React from "react";
import GameClient from "./GameClient";

// This is a server component (no "use client" directive)
interface GamePageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function MultiplayerGamePage({ params }: GamePageProps) {
  // Await resolving params, even if it's not an actual async operation
  // This fixes the Next.js warning about params needing to be awaited
  const resolvedParams = await Promise.resolve(params);
  const gameId = resolvedParams.id;

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

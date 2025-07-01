// MoveHistory component for displaying TicTacToe move history
import React from "react";
import { TicTacToeMove } from "../lib/types";

interface MoveHistoryProps {
  moves: TicTacToeMove[];
  maxHeight?: string;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  maxHeight = "200px",
}) => {
  if (moves.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-6 p-4 bg-gray-800/30 rounded-lg overflow-y-auto w-full max-w-md"
      style={{ maxHeight }}
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Move History</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {moves.map((move, index) => {
          // Safely handle potentially undefined values
          const rowDisplay = typeof move.row === "number" ? move.row + 1 : "?";
          const colDisplay = typeof move.col === "number" ? move.col + 1 : "?";

          return (
            <div
              key={index}
              className={`p-2 rounded ${
                move.player === "X" ? "bg-blue-900/30" : "bg-red-900/30"
              }`}
            >
              {index + 1}. Player {move.player}: ({rowDisplay}, {colDisplay})
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoveHistory;

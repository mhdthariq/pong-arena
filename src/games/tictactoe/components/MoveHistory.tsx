// MoveHistory component for displaying TicTacToe move history with modern UI
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
    return (
      <div className="text-center py-4 text-blue-200 italic">
        No moves yet. Make your first move!
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-blue-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Move History
      </h3>
      <div className="custom-scrollbar overflow-y-auto" style={{ maxHeight }}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {moves.map((move, index) => {
            // Safely handle potentially undefined values
            const rowDisplay =
              typeof move.row === "number" ? move.row + 1 : "?";
            const colDisplay =
              typeof move.col === "number" ? move.col + 1 : "?";
            const isRecentMove = index === moves.length - 1;

            return (
              <div
                key={index}
                className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
                  move.player === "X"
                    ? "bg-blue-900/30 border border-blue-500/30"
                    : "bg-red-900/30 border border-red-500/30"
                } ${isRecentMove ? "animate-pulse-slow" : ""}`}
              >
                <div className="flex items-center">
                  <span className="bg-gray-800/50 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span className="font-medium">
                    Player{" "}
                    <span
                      className={
                        move.player === "X" ? "text-blue-400" : "text-red-400"
                      }
                    >
                      {move.player}
                    </span>
                  </span>
                </div>
                <div className="mt-1 text-xs opacity-80 pl-7">
                  Position: ({rowDisplay}, {colDisplay})
                  {move.timestamp && (
                    <span className="block mt-0.5 text-gray-400 text-xs">
                      {new Date(move.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;

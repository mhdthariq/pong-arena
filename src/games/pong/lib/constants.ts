// Game Canvas Dimension
export const CANVAS_WIDTH = 1200; // Increased width for better desktop experience
export const CANVAS_HEIGHT = 900; // Increased height for better desktop experience

// Paddle Properties
export const PADDLE_WIDTH = 15; // Increased width for better visibility
export const PADDLE_HEIGHT = 150; // Increased height for better gameplay
export const PADDLE_SPEED = 12; // Increased speed for better responsiveness

// Ball Properties
export const BALL_SIZE = 25; // Increased ball size for better visibility
export const INITIAL_BALL_SPEED = 8; // Increased speed for more dynamic gameplay

// Game Scoring
export const MAX_SCORE = 10; // Maximum score to win the game
export const SPECIAL_SERVE_THRESHOLD = 10; // Score threshold for special serve mechanics

// UI Configuration
export const SCORE_FONT_SIZE = "78px"; // Larger score display
export const MESSAGE_FONT_SIZE = "32px"; // Message font size
export const UI_FONT_FAMILY = "Arial, Helvetica, sans-serif";
export const TITLE_FONT_SIZE = "64px"; // Title text size
export const UI_PRIMARY_COLOR = "#FFFFFF"; // White text
export const PLAYER_COLOR = "#00c6ff"; // Player color - light blue
export const AI_COLOR = "#ff4d4d"; // AI color - light red
export const FIELD_LINE_COLOR = 0x444444; // Darker lines for better contrast

// Popup UI Configuration
export const POPUP_BG_COLOR = 0x000000; // Black background
export const POPUP_BG_ALPHA = 0.7; // Semi-transparent
export const POPUP_PADDING = 30; // Padding around popup content
export const POPUP_BORDER_RADIUS = 15; // Rounded corners
export const POPUP_BORDER_COLOR = 0x444444; // Border color
export const POPUP_BORDER_WIDTH = 4; // Border thickness

export type BallState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export type PaddleState = {
  x: number;
  y: number;
  dy: number; // Add velocity for smoother movement
};

export type GameStatus = "waiting" | "playing" | "finished" | "abandoned";

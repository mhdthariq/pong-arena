# GameArena

## A Single-Player Gaming Experience Redefined

GameArena is a modern, multi-game platform that reimagines classic arcade games like Pong and Tic-Tac-Toe. It offers an immersive single-player experience where you can challenge an intelligent and customizable AI.

## Features

### Pong Arena

- **Classic Mode**: Experience the nostalgia of the original Pong game, powered by the Phaser game engine.
- **Modern Mode**: Enjoy a visually enhanced version with dynamic power-ups, advanced physics, and particle effects.
- **Customizable Experience**: Tailor your gameplay with over 40 settings, including visual themes and adjustable AI difficulty.

### Tic-Tac-Toe Reimagined

- **Game Modes**: Play "Classic," "Misère," or the strategic "Ultimate" Tic-Tac-Toe.
- **Configurable Boards**: Adjust board sizes and win lengths for a personalized gameplay experience.
- **Strategic AI**: Face an AI with multiple personalities ("balanced", "aggressive", "defensive") that uses the minimax algorithm with alpha-beta pruning for optimal play.
- **Features**: Timed moves, a full move history, and a hint system with move recommendations.

## Project Structure

- **/src/app**: Contains all Next.js App Router pages for game routes (e.g., /games/pong/classic).
- **/src/games**: Contains all core game logic, React components, and assets, separated by game (pong, tictactoe).
- **/src/shared**: Contains reusable components (like ModernLayout, GlassmorphicCard).

## Getting Started

To install dependencies: `npm install`

To run the development server: `npm run dev`

The application will be available at `http://localhost:3000`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

GameArena is built with Next.js, which seamlessly integrates with Vercel for deployment. To deploy your application, follow the [Vercel documentation](https://vercel.com/docs).

# Pong Arena

A multi-game platform featuring classic games like Pong and Tic-Tac-Toe, with both single-player and multiplayer options.

## Features

- **Multiple Games**: Play Pong or Tic-Tac-Toe
- **Single-Player Mode**: Play against AI with adjustable difficulty
- **Multiplayer Mode**: Real-time gameplay with other players using Firebase
- **Modern UI**: Responsive design with TailwindCSS
- **Built with Next.js**: Fast loading, server-side rendering

## Project Structure

```
/src
  /app                  # Next.js App Router pages
    /games              # Game pages organized by game type
      /pong             # Pong game routes
        /single-player  # Single player mode
        /multi-player   # Multiplayer modes (lobby, game)
      /tictactoe        # Tic-Tac-Toe game routes
    /single-player      # Legacy route (redirects to /games/pong/single-player)
    /multi-player       # Legacy routes (redirect to new structure)
  /games                # Game-specific logic and components
    /pong               # Pong game code
      /components       # Pong-specific React components
      /phaser           # Phaser.js scenes and config
      /lib              # Game logic, constants, types
    /tictactoe          # Tic-Tac-Toe game code
  /shared               # Shared utilities and components
    /components         # Shared React components
    /firebase           # Firebase services
    /lib                # Shared utilities
```

> **Note**: Legacy routes in `/app/single-player` and `/app/multi-player` automatically redirect to the new route structure.

## Getting Started

First, run the development server:

```bash
# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

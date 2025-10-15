import { useEffect, useRef } from "react";
import { useLoaderData, useNavigate, redirect } from "react-router";
import type { Route } from "./+types/game";
import { db } from "~/db.server";
import { GameEngine } from "~/game/core/engine";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const playerId = url.searchParams.get("playerId");

  if (!playerId) {
    return redirect("/");
  }

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      missions: {
        orderBy: { missionNumber: 'desc' },
        take: 5,
      },
    },
  });

  if (!player) {
    return redirect("/");
  }

  return { player };
}

export default function Game({ loaderData }: Route.ComponentProps) {
  const { player } = loaderData;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine with player's difficulty
    const engine = new GameEngine(canvas, player.difficulty as 'recruit' | 'soldier' | 'veteran' | 'hero');
    engineRef.current = engine;
    engine.start();

    // Cleanup on unmount
    return () => {
      engine.stop();
    };
  }, []);

  const handleReturnToMenu = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
      {/* Game header */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">
          ⚙️ AETHER SQUADRON ⚙️
        </h1>
        <p className="text-gray-300">
          Pilot: <span className="text-amber-300 font-bold">{player.name}</span> |
          Mission: <span className="text-green-400 font-bold">{player.currentMission}</span> |
          Credits: <span className="text-yellow-400 font-bold">{player.credits}</span>
        </p>
      </div>

      {/* Game canvas */}
      <div className="relative border-4 border-amber-600 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="bg-black rounded"
        />
      </div>

      {/* Controls info */}
      <div className="mt-4 text-center space-y-2">
        <p className="text-gray-400 text-sm">
          WASD or Arrow Keys to move • ESC to pause
        </p>
        <button
          onClick={handleReturnToMenu}
          className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-700 hover:to-red-600 text-white font-bold rounded border-2 border-gray-500 hover:border-red-500 transition-all"
        >
          ← Return to Menu
        </button>
      </div>

      {/* Mission briefing */}
      <div className="mt-6 max-w-2xl bg-gray-800/50 border border-amber-600 rounded-lg p-4">
        <h3 className="text-amber-400 font-bold text-lg mb-2">📜 Mission 1: Training Flight</h3>
        <p className="text-gray-300 text-sm">
          Welcome to the Aether Squadron, pilot! This is your training mission.
          Get familiar with your ship's controls and navigation. Fly through the
          void and prove you have what it takes to join the fight against the
          encroaching darkness. More challenging missions await...
        </p>
      </div>
    </div>
  );
}

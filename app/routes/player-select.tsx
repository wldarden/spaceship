import { Form, Link, useLoaderData, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/player-select";
import { db } from "~/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const players = await db.player.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      missions: {
        where: { completed: true },
        orderBy: { missionNumber: 'desc' },
        take: 1
      }
    }
  });

  return { players };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const playerName = formData.get("playerName") as string;

    if (!playerName || playerName.trim().length === 0) {
      return { error: "Player name is required" };
    }

    try {
      const player = await db.player.create({
        data: {
          name: playerName.trim(),
        },
      });

      return redirect(`/profile/${player.id}`);
    } catch (error) {
      return { error: "Player name already exists" };
    }
  }

  if (intent === "select") {
    const playerId = formData.get("playerId") as string;
    return redirect(`/profile/${playerId}`);
  }

  return { error: "Invalid action" };
}

export default function PlayerSelect({ loaderData, actionData }: Route.ComponentProps) {
  const { players } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Steampunk-style header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-amber-400" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            ⚙️ AETHER SQUADRON ⚙️
          </h1>
          <p className="text-xl text-gray-300">Select Your Pilot</p>
          <div className="mt-2 text-sm text-gray-400">A Steampunk Space Adventure</div>
        </div>

        {/* Error message */}
        {actionData?.error && (
          <div className="max-w-md mx-auto mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
            {actionData.error}
          </div>
        )}

        {/* Existing Players */}
        {players.length > 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4 text-amber-300">⚡ Active Pilots</h2>
            <div className="space-y-3">
              {players.map((player) => {
                const lastMission = player.missions[0];
                const progress = lastMission ? lastMission.missionNumber : 0;

                return (
                  <div key={player.id} className="bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-amber-600 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-xl font-bold text-amber-300">{player.name}</div>
                        <div className="text-sm text-gray-400">
                          Mission: {player.currentMission} | Credits: {player.credits}
                        </div>
                        {progress > 0 && (
                          <div className="text-xs text-green-400 mt-1">
                            ✓ {progress} missions completed
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/profile/${player.id}`}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all"
                        >
                          🏠 Base
                        </Link>
                        <Link
                          to={`/game?playerId=${player.id}`}
                          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-all"
                        >
                          ▶️ Fly
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create New Player */}
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-amber-300">✨ New Pilot</h2>
          <Form method="post" className="bg-gray-800 border-2 border-amber-600 rounded-lg p-6">
            <input type="hidden" name="intent" value="create" />
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                Pilot Name
              </label>
              <input
                type="text"
                id="playerName"
                name="playerName"
                required
                maxLength={30}
                className="w-full px-4 py-2 bg-gray-900 border border-amber-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your name..."
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "⚙️ Create Pilot"}
            </button>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Use WASD or Arrow Keys to fly • ESC to pause</p>
        </div>
      </div>
    </div>
  );
}

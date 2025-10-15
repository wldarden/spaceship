import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/profile.$playerId";
import { db } from "~/db.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { playerId } = params;

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      missions: {
        orderBy: { missionNumber: 'asc' },
      },
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: 'desc' },
      },
    },
  });

  if (!player) {
    return redirect("/");
  }

  // Calculate some derived stats
  const completedMissions = player.missions.filter(m => m.completed);
  const totalStars = completedMissions.reduce((sum, m) => sum + m.stars, 0);
  const maxStars = completedMissions.length * 3; // Assuming 3 stars per mission

  return {
    player,
    completedMissions,
    totalStars,
    maxStars,
  };
}

export default function PlayerProfile({ loaderData }: Route.ComponentProps) {
  const { player, completedMissions, totalStars, maxStars } = loaderData;

  // Format flight time to hours and minutes
  const hours = Math.floor(player.totalFlightTime / 3600);
  const minutes = Math.floor((player.totalFlightTime % 3600) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-amber-400 mb-2">
              ⚙️ {player.name}'s Command Center
            </h1>
            <p className="text-gray-400">Welcome back, Commander</p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded border-2 border-gray-500 transition-all"
          >
            ← Back to Pilots
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Player Stats Card */}
            <div className="bg-gray-800/80 border-2 border-amber-600 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">📊 Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Score:</span>
                  <span className="text-green-400 font-bold">{player.totalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Credits:</span>
                  <span className="text-yellow-400 font-bold">{player.credits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Missions Complete:</span>
                  <span className="text-blue-400 font-bold">{completedMissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Stars Earned:</span>
                  <span className="text-amber-400 font-bold">{totalStars} / {maxStars}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between">
                  <span className="text-gray-300">Enemies Killed:</span>
                  <span className="text-red-400 font-bold">{player.enemiesKilled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Ships Destroyed:</span>
                  <span className="text-orange-400 font-bold">{player.shipsDestroyed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Powerups Collected:</span>
                  <span className="text-purple-400 font-bold">{player.powerupsCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Flight Time:</span>
                  <span className="text-cyan-400 font-bold">
                    {hours}h {minutes}m
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-gray-800/80 border-2 border-amber-600 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">🏅 Achievements</h2>
              {player.achievements.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {player.achievements.map((pa) => (
                    <div
                      key={pa.id}
                      className="bg-gray-700/50 rounded p-3 border border-amber-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{pa.achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-amber-300">{pa.achievement.name}</div>
                          <div className="text-xs text-gray-400">{pa.achievement.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No achievements yet. Complete missions to earn medals!
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Missions & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to={`/upgrades/${player.id}`}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-900 font-bold py-6 px-6 rounded-lg border-2 border-amber-400 transition-all text-center"
              >
                <div className="text-3xl mb-2">⚙️</div>
                <div className="text-xl">Ship Upgrades</div>
                <div className="text-sm opacity-80">Enhance your vessel</div>
              </Link>
              <Link
                to={`/game?playerId=${player.id}`}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-6 px-6 rounded-lg border-2 border-green-400 transition-all text-center"
              >
                <div className="text-3xl mb-2">🚀</div>
                <div className="text-xl">Current Mission</div>
                <div className="text-sm opacity-80">Mission {player.currentMission}</div>
              </Link>
            </div>

            {/* Mission Selection */}
            <div className="bg-gray-800/80 border-2 border-amber-600 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">📜 Mission Selection</h2>

              {/* Current/Next Mission */}
              <div className="mb-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 border-2 border-green-500 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">NEXT MISSION</div>
                    <div className="text-2xl font-bold text-green-400">Mission {player.currentMission}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      {getMissionTitle(player.currentMission)}
                    </div>
                  </div>
                  <Link
                    to={`/game?playerId=${player.id}`}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded border-2 border-green-400 transition-all"
                  >
                    Launch ▶️
                  </Link>
                </div>
              </div>

              {/* Completed Missions */}
              {completedMissions.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-amber-300 mb-3">Completed Missions (Replay)</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {completedMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-amber-500 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-400">Mission {mission.missionNumber}</span>
                              <span className="text-gray-400">-</span>
                              <span className="text-gray-300">{getMissionTitle(mission.missionNumber)}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-green-400">Score: {mission.score.toLocaleString()}</span>
                              <span className="text-amber-400">
                                {"⭐".repeat(mission.stars)}{"☆".repeat(3 - mission.stars)}
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/game?playerId=${player.id}&mission=${mission.missionNumber}`}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all"
                          >
                            Replay
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {completedMissions.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  Complete missions to unlock replay mode!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get mission titles (we can expand this later)
function getMissionTitle(missionNumber: number): string {
  const titles: Record<number, string> = {
    1: "Training Flight",
    2: "First Contact",
    3: "Supply Run",
    4: "Escort Mission",
    5: "Enemy Stronghold",
    6: "The Ace",
    7: "Behind Enemy Lines",
    8: "The Final Push",
  };
  return titles[missionNumber] || "Unknown Mission";
}

import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/upgrades.$playerId";
import { db } from "~/db.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { playerId } = params;

  const player = await db.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    return redirect("/");
  }

  return { player };
}

export default function Upgrades({ loaderData }: Route.ComponentProps) {
  const { player } = loaderData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-amber-400 mb-2">
              ⚙️ Ship Upgrades & Workshop
            </h1>
            <p className="text-gray-400">Enhance your vessel for the battles ahead</p>
          </div>
          <Link
            to={`/profile/${player.id}`}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded border-2 border-gray-500 transition-all"
          >
            ← Back to Command Center
          </Link>
        </div>

        {/* Credits Display */}
        <div className="bg-gray-800/80 border-2 border-amber-600 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400">AVAILABLE CREDITS</div>
              <div className="text-4xl font-bold text-yellow-400">{player.credits.toLocaleString()}</div>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-500 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Under Construction</h2>
          <p className="text-xl text-gray-300 mb-6">
            The workshop is being prepared! Soon you'll be able to:
          </p>
          <div className="max-w-2xl mx-auto text-left space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span>Upgrade ship speed, firepower, and armor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔫</span>
              <span>Purchase new weapon systems</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <span>Install defensive equipment and shields</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✈️</span>
              <span>Unlock and buy new ship models</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <span>Customize ship appearance and paint jobs</span>
            </div>
          </div>
          <div className="mt-8">
            <Link
              to={`/profile/${player.id}`}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all inline-block"
            >
              Return to Command Center
            </Link>
          </div>
        </div>

        {/* Placeholder upgrade categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 opacity-50">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6">
            <div className="text-4xl mb-3 text-center">⚡</div>
            <h3 className="text-xl font-bold text-center text-amber-400 mb-2">Performance</h3>
            <p className="text-sm text-gray-400 text-center">Speed & Maneuverability</p>
          </div>
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6">
            <div className="text-4xl mb-3 text-center">🔫</div>
            <h3 className="text-xl font-bold text-center text-amber-400 mb-2">Weapons</h3>
            <p className="text-sm text-gray-400 text-center">Firepower & Systems</p>
          </div>
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6">
            <div className="text-4xl mb-3 text-center">🛡️</div>
            <h3 className="text-xl font-bold text-center text-amber-400 mb-2">Defense</h3>
            <p className="text-sm text-gray-400 text-center">Armor & Shields</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Route } from "./+types/api.save-progress";
import { db } from "~/db.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { playerId, missionNumber, score, completed, stars } = body;

    if (!playerId || typeof missionNumber !== "number") {
      return Response.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Upsert mission progress
    const mission = await db.mission.upsert({
      where: {
        playerId_missionNumber: {
          playerId,
          missionNumber,
        },
      },
      update: {
        score: Math.max(score || 0, 0),
        completed: completed || false,
        stars: Math.max(stars || 0, 0),
      },
      create: {
        playerId,
        missionNumber,
        score: score || 0,
        completed: completed || false,
        stars: stars || 0,
      },
    });

    // Update player's current mission if completed
    if (completed) {
      await db.player.update({
        where: { id: playerId },
        data: {
          currentMission: Math.max(missionNumber + 1, missionNumber),
        },
      });
    }

    return Response.json({ success: true, mission });
  } catch (error) {
    console.error("Error saving progress:", error);
    return Response.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/player-select.tsx"),
  route("profile/:playerId", "routes/profile.$playerId.tsx"),
  route("upgrades/:playerId", "routes/upgrades.$playerId.tsx"),
  route("game", "routes/game.tsx"),
  route("api/save-progress", "routes/api.save-progress.tsx"),
] satisfies RouteConfig;

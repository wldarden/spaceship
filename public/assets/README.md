# Assets Guide for AiSpaceShip

## 📁 Folder Structure

```
public/assets/
├── ships/          - Player ships and variants
├── enemies/        - Enemy ships, aircraft, obstacles
├── backgrounds/    - Background layers, clouds, space scenes
├── powerups/       - Collectible powerups and items
├── weapons/        - Projectiles, bullets, missiles
├── ui/             - HUD elements, buttons, icons
└── effects/        - Explosions, smoke, particle effects
```

## 🎨 Best File Formats

### **PNG (Recommended for most assets)**
- **Use for:** Ships, enemies, powerups, UI elements, effects
- **Why:** Supports transparency, widely supported, good quality
- **Best practices:**
  - Use transparent backgrounds
  - Keep file sizes reasonable (optimize with tools like TinyPNG)
  - Recommended sizes:
    - Player ships: 64x64 to 128x128 pixels
    - Enemies: 32x32 to 96x96 pixels
    - Powerups: 32x32 to 48x48 pixels
    - Effects: 64x64 to 128x128 pixels

### **JPEG/JPG**
- **Use for:** Large background images without transparency
- **Why:** Smaller file sizes for photos/paintings
- **Note:** No transparency support

### **SVG (Optional)**
- **Use for:** UI elements, icons, logos
- **Why:** Scales perfectly at any resolution
- **Note:** More complex to animate in canvas

### **Sprite Sheets (Advanced)**
- Combine multiple frames into one image
- Great for animations (explosions, engine flames, etc.)
- Format: PNG with transparency
- Name with frame info: `explosion_128x128_8frames.png`

## 🎮 Canvas Size Reference

Current game canvas: **1200px × 800px**

## 📐 Recommended Asset Sizes

| Asset Type | Size (pixels) | Notes |
|------------|---------------|-------|
| Player Ship | 80x100 | Main player ship |
| Small Enemy | 40x40 | Basic enemy fighters |
| Medium Enemy | 64x64 | Medium difficulty |
| Large Enemy/Boss | 128x128+ | Boss battles |
| Powerup | 32x32 | Collectibles |
| Bullet (player) | 8x16 | Small projectiles |
| Bullet (enemy) | 8x8 | Enemy projectiles |
| Explosion | 64x64 | Particle effects |
| Background Tile | 1200x800 | Full screen backgrounds |

## 🚀 How to Add Assets to the Game

1. Drop your PNG/JPG files into the appropriate folder
2. Use descriptive names: `player_ship_bronze.png`, `enemy_bomber_1.png`
3. Assets are automatically served from `/assets/` URL path
4. Example in code:
   ```typescript
   const shipImage = new Image();
   shipImage.src = '/assets/ships/player_ship_bronze.png';
   ```

## 🎨 Art Style Tips for Steampunk Theme

- Bronze, copper, brass metallic colors
- Gears, rivets, pipes, steam vents
- Victorian-era aesthetic mixed with sci-fi
- Weathered, industrial look
- Glowing blue/purple "aether" energy effects
- Add goggles, top hats, monocles for character

## 🔧 Asset Optimization

- Keep individual files under 100KB when possible
- Use transparency wisely (fully transparent pixels add file size)
- Test assets at actual game scale
- Consider sprite sheets for animated sequences

## 📝 Naming Conventions

Use descriptive, lowercase names with underscores:
- `player_ship_fighter.png`
- `enemy_bomber_01.png`
- `powerup_shield.png`
- `explosion_large_01.png`
- `bg_space_clouds.jpg`

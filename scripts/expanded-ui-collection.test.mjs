import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (value) => value.slice(1))), "..");
const presetsRoot = path.join(root, "assets", "presets");

async function expandedThemes() {
  const entries = await fs.readdir(presetsRoot, { withFileTypes: true });
  const themes = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(presetsRoot, entry.name, "theme.json");
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
      if (String(manifest.uuid).startsWith("collection-")) {
        themes.push({ dir: path.dirname(manifestPath), manifest });
      }
    } catch {
      // Other preset validation is covered by the engine tests.
    }
  }
  return themes;
}

describe("expanded UI collection", () => {
  it("ships every generated theme with a mascot and upgraded metadata", async () => {
    const themes = await expandedThemes();
    assert.equal(themes.length, 35);

    for (const { dir, manifest } of themes) {
      assert.equal(manifest.version, "1.2.0", manifest.id);
      assert.equal(manifest.stamp, "stamp.webp", manifest.id);
      assert.ok(manifest.tags.includes("\u89d2\u8272"), manifest.id);
      assert.ok(manifest.tags.includes("\u52a8\u6001"), manifest.id);

      for (const file of [manifest.hero, manifest.preview, manifest.stamp]) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        assert.ok(stat.size > 10_000, `${manifest.id}/${file} is unexpectedly small`);
      }

      const stamp = await sharp(path.join(dir, manifest.stamp)).metadata();
      assert.equal(stamp.width, 720, manifest.id);
      assert.equal(stamp.height, 720, manifest.id);
      assert.equal(stamp.hasAlpha, true, manifest.id);
    }
  });

  it("keeps the mascot motion lightweight and accessible", async () => {
    const css = await fs.readFile(path.join(root, "assets", "inject", "dream-skin.css"), "utf8");
    assert.match(css, /data-dream-collection="expanded"/);
    assert.match(css, /@keyframes ds-expanded-mascot-float/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  });
});

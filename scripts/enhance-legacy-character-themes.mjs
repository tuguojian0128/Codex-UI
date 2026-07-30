import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { characterDefs, characterMarkup, getCharacterConcept } from "./lib/character-illustration.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presetsRoot = path.join(root, "assets", "presets");

const TARGETS = [
  "cherry-frost",
  "clear-cyan",
  "cream-sage",
  "honey-milk",
  "ink-gold",
  "linen-rose",
  "peach-blush",
  "soft-moss",
  "vanilla-sky",
  "velvet-plum",
  "aurora-observatory",
  "ember-archive",
  "nocturne-bloom",
  "polar-signal",
  "porcelain-circuit",
];

const hexFromColor = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const match = value.match(/#[0-9a-f]{6}/i);
  return match?.[0] ?? fallback;
};

function themeForIllustration(manifest) {
  const palette = manifest.light ?? {};
  const colors = [
    hexFromColor(palette.background, "#f4f6fa"),
    hexFromColor(palette.panelAlt, "#dce3ee"),
    hexFromColor(palette.accent, "#5577dd"),
    hexFromColor(palette.highlight ?? palette.accentAlt, "#85d7ff"),
  ];
  const rgb = Number.parseInt(colors[0].slice(1), 16);
  const luminance = (((rgb >> 16) & 255) * .299) + (((rgb >> 8) & 255) * .587) + ((rgb & 255) * .114);
  return { id: manifest.id, colors, mode: luminance < 132 ? "dark" : "light" };
}

function overlaySvg(theme, width, height, preview) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${characterDefs(theme)}</defs>${characterMarkup(theme, width, height, { preview })}</svg>`);
}

function previewChromeSvg(theme, width, height) {
  const [, c1, c2, c3] = theme.colors;
  const dark = theme.mode === "dark";
  const panel = dark ? "rgba(8,14,25,.72)" : "rgba(255,255,255,.72)";
  const panelStrong = dark ? "rgba(15,24,38,.9)" : "rgba(255,255,255,.92)";
  const ink = dark ? "#f5f8ff" : "#243047";
  const muted = dark ? "rgba(210,222,238,.42)" : "rgba(57,72,93,.34)";
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><filter id="legacyFrameShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="${dark ? .34 : .15}"/></filter></defs>
    <g filter="url(#legacyFrameShadow)">
      <rect x="30" y="28" width="660" height="394" rx="28" fill="${dark ? "rgba(5,9,17,.52)" : "rgba(255,255,255,.48)"}" stroke="rgba(255,255,255,.46)" stroke-width="2"/>
      <rect x="30" y="28" width="124" height="394" rx="28" fill="${panelStrong}"/>
      <path d="M154 28V422" stroke="${muted}"/>
      <circle cx="53" cy="53" r="6" fill="${c2}"/><circle cx="74" cy="53" r="6" fill="${c3}"/>
      <rect x="50" y="85" width="77" height="15" rx="7" fill="${c2}" opacity=".24"/>
      <rect x="50" y="131" width="62" height="9" rx="4" fill="${c2}" opacity=".7"/>
      <rect x="50" y="169" width="48" height="8" rx="4" fill="${muted}"/>
      <rect x="50" y="206" width="68" height="8" rx="4" fill="${muted}"/>
      <rect x="50" y="280" width="52" height="8" rx="4" fill="${muted}"/>
      <rect x="50" y="317" width="72" height="8" rx="4" fill="${muted}"/>
      <rect x="181" y="65" width="174" height="17" rx="8" fill="${ink}" opacity=".88"/>
      <rect x="181" y="101" width="258" height="9" rx="4" fill="${muted}"/>
      <rect x="181" y="132" width="205" height="9" rx="4" fill="${muted}" opacity=".72"/>
      <rect x="181" y="173" width="142" height="103" rx="22" fill="${panelStrong}" stroke="rgba(255,255,255,.48)"/>
      <rect x="340" y="173" width="142" height="103" rx="22" fill="${panelStrong}" stroke="rgba(255,255,255,.48)"/>
      <circle cx="209" cy="204" r="13" fill="${c2}" opacity=".84"/><circle cx="368" cy="204" r="13" fill="${c3}" opacity=".84"/>
      <rect x="202" y="232" width="76" height="8" rx="4" fill="${ink}" opacity=".48"/><rect x="361" y="232" width="76" height="8" rx="4" fill="${ink}" opacity=".48"/>
      <rect x="181" y="308" width="319" height="57" rx="19" fill="${panel}" stroke="${c2}" stroke-opacity=".3"/>
      <rect x="207" y="333" width="176" height="8" rx="4" fill="${muted}"/><circle cx="466" cy="336" r="16" fill="${c2}"/>
    </g>
  </svg>`);
}

for (const id of TARGETS) {
  const dir = path.join(presetsRoot, id);
  const manifestPath = path.join(dir, "theme.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const theme = themeForIllustration(manifest);
  const concept = getCharacterConcept(theme);
  const simpleBackground = await fs.access(path.join(dir, "background.png")).then(() => true).catch(() => false);
  const sourceHero = path.join(dir, simpleBackground ? "background.png" : "hero.png");
  const sourcePreview = path.join(dir, "preview.png");

  await sharp(sourceHero)
    .resize(1600, 1000, { fit: "cover" })
    .composite([{ input: overlaySvg(theme, 1600, 1000, false), blend: "over" }])
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(dir, "character-hero.webp"));

  await sharp(sourcePreview)
    .resize(720, 450, { fit: "cover" })
    .composite([
      ...(simpleBackground ? [{ input: previewChromeSvg(theme, 720, 450), blend: "over" }] : []),
      { input: overlaySvg(theme, 720, 450, true), blend: "over" },
    ])
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(dir, "character-preview.webp"));

  const next = {
    ...manifest,
    version: "2.1.0",
    galleryVisible: true,
    description: `${manifest.description} 加入原创动漫游戏风角色「${concept.nameZh}」，强化主题叙事与视觉辨识度。`,
    tags: [...new Set([...(manifest.tags ?? []), "原创角色", "动漫游戏风", concept.nameZh])],
    hero: "character-hero.webp",
    preview: "character-preview.webp",
    heroFocusX: .67,
    heroFocusY: .44,
    heroScrim: Math.min(manifest.heroScrim ?? .35, .28),
    wallpaper: "character-hero.webp",
    wallpaperEnabled: true,
    wallpaperFocusX: .66,
    wallpaperFocusY: .44,
    wallpaperOpacity: Math.max(manifest.wallpaperOpacity ?? 0, .36),
    wallpaperBlur: Math.min(manifest.wallpaperBlur ?? 0, 1),
    brandSubtitle: `${concept.nameEn} · CODEX-UI`,
    statusText: `${concept.nameEn} · READY`,
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

console.log(`Enhanced ${TARGETS.length} legacy themes with full-size original characters.`);
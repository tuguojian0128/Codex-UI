import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presetsRoot = path.join(root, "assets", "presets");

const THEMES = [
  { id: "liquid-aqua-lens", zh: "流光水镜", en: "Aqua Lens", motif: "liquid", layout: "split-studio", mode: "light", colors: ["#e9f7ff", "#a9dcff", "#5d7dff", "#63efd7"], tagline: "让思路像水面一样清澈展开。", description: "清透蓝色折射、圆润光学镜片与低饱和玻璃层构成的液态工作台。", tags: ["液态玻璃", "清透", "蓝色", "现代"] },
  { id: "liquid-orchid-prism", zh: "兰紫棱镜", en: "Orchid Prism", motif: "liquid", layout: "full-canvas", mode: "dark", colors: ["#120d26", "#3c2468", "#a96dff", "#72d9ff"], tagline: "把灵感折射成可执行的光谱。", description: "兰紫色液态镜片、冷蓝折射边缘与深色玻璃面板组成的沉浸界面。", tags: ["液态玻璃", "紫色", "棱镜", "沉浸"] },
  { id: "liquid-sunrise-gel", zh: "晨曦凝胶", en: "Sunrise Gel", motif: "liquid", layout: "dream-banner", mode: "light", colors: ["#fff4ed", "#ffd0b7", "#ff7d73", "#ffca63"], tagline: "把清晨的柔光带进每一次构建。", description: "珊瑚橙、暖黄色与乳白凝胶质感叠加的柔和液态玻璃主题。", tags: ["液态玻璃", "暖色", "日出", "柔和"] },
  { id: "liquid-graphite-orbit", zh: "石墨光环", en: "Graphite Orbit", motif: "liquid", layout: "minimal-focus", mode: "dark", colors: ["#07090d", "#202734", "#d7e1ff", "#62a7ff"], tagline: "让黑色界面保持安静，也保持层次。", description: "石墨黑背景、银蓝边缘与悬浮玻璃光环组成的高对比专业主题。", tags: ["液态玻璃", "石墨", "极简", "专业"] },
  { id: "liquid-mint-capsule", zh: "薄荷胶囊", en: "Mint Capsule", motif: "liquid", layout: "split-studio", mode: "light", colors: ["#effff9", "#bdf5df", "#35c99a", "#7b8cff"], tagline: "用轻盈的薄荷色整理复杂任务。", description: "薄荷绿胶囊、柔紫折射与珍珠白表面结合的轻盈玻璃界面。", tags: ["液态玻璃", "薄荷", "轻盈", "效率"] },
  { id: "liquid-coral-spectrum", zh: "珊瑚光谱", en: "Coral Spectrum", motif: "liquid", layout: "full-canvas", mode: "dark", colors: ["#180d19", "#54203c", "#ff6f91", "#ffb45f"], tagline: "让大胆的色彩推动更快的决定。", description: "珊瑚红、桃橙光晕与深莓色玻璃层构成的高能液态主题。", tags: ["液态玻璃", "珊瑚", "高能", "光谱"] },
  { id: "liquid-arctic-pearl", zh: "极地珍珠", en: "Arctic Pearl", motif: "liquid", layout: "dream-banner", mode: "light", colors: ["#f8fbff", "#dce8f6", "#8aabcc", "#b6a7ff"], tagline: "在珍珠般的冷光里保持专注。", description: "冰白珍珠、淡蓝灰折射与少量紫色偏光形成的精致玻璃主题。", tags: ["液态玻璃", "珍珠", "冰白", "精致"] },
  { id: "liquid-midnight-wave", zh: "午夜流波", en: "Midnight Wave", motif: "liquid", layout: "cinematic-live", mode: "dark", colors: ["#020714", "#0b3152", "#0d9dff", "#5ef2d6"], tagline: "让深夜的每一行代码都有流动感。", description: "午夜蓝水波、青色光带和深海玻璃层构成的动态感界面。", tags: ["液态玻璃", "午夜", "深海", "流动"] },

  { id: "cobalt-blueprint", zh: "钴蓝蓝图", en: "Cobalt Blueprint", motif: "blueprint", layout: "terminal-grid", mode: "dark", colors: ["#07162a", "#0d3158", "#3ca7ff", "#7bd8ff"], tagline: "把系统结构画成一张可读蓝图。", description: "工程网格、钴蓝坐标线与技术标记组成的结构化开发主题。", tags: ["蓝图", "工程", "网格", "深色"] },
  { id: "matcha-notebook", zh: "抹茶手记", en: "Matcha Notebook", motif: "paper", layout: "paper-board", mode: "light", colors: ["#f5f2e7", "#dce6c7", "#78935d", "#d79a75"], tagline: "像整理手账一样整理项目。", description: "抹茶绿、米色纸张与手工便签层次组成的温柔工作板。", tags: ["纸张", "抹茶", "手账", "治愈"] },
  { id: "noir-command", zh: "黑曜指令", en: "Noir Command", motif: "terminal", layout: "terminal-grid", mode: "dark", colors: ["#050607", "#15191d", "#e8f0f2", "#63ffb2"], tagline: "删去噪音，只留下指令与结果。", description: "纯黑控制台、银灰文本和荧光绿状态提示组成的硬朗终端主题。", tags: ["终端", "黑色", "极简", "命令行"] },
  { id: "sakura-workbench", zh: "樱粉工坊", en: "Sakura Workbench", motif: "petals", layout: "split-studio", mode: "light", colors: ["#fff3f6", "#f8c8d5", "#d96891", "#8d83d8"], tagline: "让灵感在轻柔的花瓣间落地。", description: "樱粉渐变、花瓣散点与柔紫工作面板组成的清新创作界面。", tags: ["樱花", "粉色", "创作", "清新"] },
  { id: "desert-solar", zh: "沙丘日轮", en: "Desert Solar", motif: "sunset", layout: "full-canvas", mode: "light", colors: ["#fff1d8", "#e8a65c", "#b85f35", "#f6cc68"], tagline: "用温暖的秩序穿过复杂沙丘。", description: "沙金、陶土红与巨大日轮构成的宽阔全景主题。", tags: ["沙漠", "日落", "暖色", "全景"] },
  { id: "nebula-ink", zh: "星云墨迹", en: "Nebula Ink", motif: "aurora", layout: "cinematic-live", mode: "dark", colors: ["#080713", "#2b154d", "#8b5cff", "#ff6bb5"], tagline: "把深空中的不确定写成答案。", description: "紫色星云、粉色能量带与墨黑空间组成的电影感开发界面。", tags: ["星云", "紫色", "电影感", "深空"] },
  { id: "cyber-lime-grid", zh: "赛博青柠", en: "Cyber Lime Grid", motif: "grid", layout: "terminal-grid", mode: "dark", colors: ["#07100b", "#163023", "#a9ff52", "#2ee6c5"], tagline: "让每一次运行都像信号点亮。", description: "深绿网格、青柠光标与青色信号线构成的赛博终端主题。", tags: ["赛博", "青柠", "网格", "高对比"] },
  { id: "terracotta-studio", zh: "陶土工作室", en: "Terracotta Studio", motif: "mosaic", layout: "split-studio", mode: "light", colors: ["#f7eee7", "#d99a7c", "#a9543f", "#5b8f82"], tagline: "让工具保持温度，让结构保持清楚。", description: "陶土色块、鼠尾草绿与现代拼贴构成的温暖工作室主题。", tags: ["陶土", "拼贴", "工作室", "温暖"] },
  { id: "lavender-focus", zh: "薰衣草专注", en: "Lavender Focus", motif: "minimal", layout: "minimal-focus", mode: "light", colors: ["#f7f3ff", "#ddd2ff", "#8066ce", "#62b9c7"], tagline: "给重要的事情留下更多呼吸。", description: "薰衣草紫、极简光盘与宽松留白组成的安静专注主题。", tags: ["薰衣草", "极简", "专注", "留白"] },
  { id: "arctic-blueprint", zh: "冰原架构", en: "Arctic Blueprint", motif: "blueprint", layout: "split-studio", mode: "light", colors: ["#eef8fb", "#c8e6ef", "#287d9b", "#70a0d8"], tagline: "让复杂架构像冰层剖面一样清晰。", description: "冰青网格、蓝灰技术线和明亮工作区组成的冷静架构主题。", tags: ["冰原", "蓝图", "架构", "冷色"] },
  { id: "forest-signal", zh: "森林信号", en: "Forest Signal", motif: "topography", layout: "full-canvas", mode: "dark", colors: ["#07130e", "#163527", "#58c98b", "#d2df65"], tagline: "在森林般复杂的系统中找到路径。", description: "深林绿、地形等高线与黄绿色信号点构成的探索主题。", tags: ["森林", "地形", "信号", "探索"] },
  { id: "obsidian-gold", zh: "黑曜鎏金", en: "Obsidian Gold", motif: "orbit", layout: "dream-banner", mode: "dark", colors: ["#070707", "#241d13", "#d9b45f", "#f6e0a1"], tagline: "用克制的金色标记关键路径。", description: "黑曜石底色、细金环与温暖高光组成的高级深色界面。", tags: ["黑曜石", "金色", "高级", "克制"] },
  { id: "rose-quartz-desk", zh: "玫瑰石英", en: "Rose Quartz Desk", motif: "mosaic", layout: "paper-board", mode: "light", colors: ["#fff2f3", "#f4c9cd", "#c86878", "#b999cf"], tagline: "把任务摆成一张柔和而清楚的桌面。", description: "玫瑰石英色块、柔紫阴影与纸板布局组成的精致桌面主题。", tags: ["玫瑰", "石英", "桌面", "柔和"] },
  { id: "midnight-violet", zh: "午夜紫电", en: "Midnight Violet", motif: "ribbons", layout: "cinematic-live", mode: "dark", colors: ["#070713", "#26184b", "#7f62ff", "#5bd8ff"], tagline: "在深夜保持速度，也保持方向。", description: "紫色电光丝带、冷蓝轨迹与深黑舞台组成的速度感主题。", tags: ["午夜", "紫电", "速度", "深色"] },
  { id: "cloud-white-space", zh: "云白空间", en: "Cloud White Space", motif: "minimal", layout: "minimal-focus", mode: "light", colors: ["#fbfcfe", "#e7ebf2", "#55708f", "#89aee0"], tagline: "用最少的视觉元素承载最多的思考。", description: "云白背景、柔灰层次与淡蓝焦点组成的纯净生产力主题。", tags: ["云白", "留白", "纯净", "生产力"] },
  { id: "copper-circuit", zh: "铜色电路", en: "Copper Circuit", motif: "grid", layout: "terminal-grid", mode: "dark", colors: ["#100c0a", "#332018", "#d98752", "#58c7a6"], tagline: "让古铜质感连接现代工程。", description: "深棕底色、铜色电路线与青绿节点构成的复古工程主题。", tags: ["铜色", "电路", "复古", "工程"] },
  { id: "marine-depth", zh: "深海层流", en: "Marine Depth", motif: "waves", layout: "full-canvas", mode: "dark", colors: ["#031019", "#07364c", "#1aa6c8", "#63e1cf"], tagline: "让信息像海流一样有层次地抵达。", description: "深海蓝、青色层流与微光气泡组成的沉浸式海洋主题。", tags: ["深海", "海流", "青色", "沉浸"] },
  { id: "candy-pop-lab", zh: "糖果实验室", en: "Candy Pop Lab", motif: "mosaic", layout: "split-studio", mode: "light", colors: ["#fff8fb", "#ffd2e3", "#ff5e9c", "#6f8cff"], tagline: "用快乐的色彩快速试验大胆想法。", description: "糖果粉、亮蓝按钮与模块化彩色卡片组成的活泼实验室主题。", tags: ["糖果", "活泼", "实验室", "彩色"] },
  { id: "monochrome-editor", zh: "单色编辑器", en: "Monochrome Editor", motif: "minimal", layout: "minimal-focus", mode: "dark", colors: ["#080808", "#202020", "#f2f2f2", "#8f8f8f"], tagline: "让层级来自排版，而不是噪音。", description: "黑白灰层级、严谨间距与极少装饰组成的专业编辑器主题。", tags: ["单色", "编辑器", "排版", "专业"] },
  { id: "sunrise-canvas", zh: "日出画布", en: "Sunrise Canvas", motif: "sunset", layout: "dream-banner", mode: "light", colors: ["#fff8e9", "#ffd49b", "#f28b63", "#7a9ad8"], tagline: "从一块温暖的空白画布开始。", description: "浅金天空、粉橙日轮与远蓝阴影组成的明亮创作主题。", tags: ["日出", "画布", "明亮", "创作"] },
  { id: "jade-terminal", zh: "翡翠终端", en: "Jade Terminal", motif: "terminal", layout: "terminal-grid", mode: "dark", colors: ["#04100c", "#102c22", "#3ee39d", "#c9f46b"], tagline: "让命令流保持锋利而清晰。", description: "墨绿控制台、翡翠光标与黄绿状态标记组成的现代终端主题。", tags: ["翡翠", "终端", "命令行", "现代"] },
  { id: "porcelain-minimal", zh: "瓷白极简", en: "Porcelain Minimal", motif: "orbit", layout: "minimal-focus", mode: "light", colors: ["#f9faf8", "#e8ece8", "#526b66", "#8ca8b5"], tagline: "像瓷器一样干净，像工具一样可靠。", description: "瓷白表面、细灰边线与青灰焦点组成的克制极简主题。", tags: ["瓷白", "极简", "克制", "可靠"] },
  { id: "volcanic-signal", zh: "火山信号", en: "Volcanic Signal", motif: "ribbons", layout: "full-canvas", mode: "dark", colors: ["#120706", "#421611", "#ff5a38", "#ffb45c"], tagline: "把高压任务转化为清晰的能量轨迹。", description: "熔岩红轨迹、火山黑背景与橙色信号点组成的高强度主题。", tags: ["火山", "熔岩", "高强度", "信号"] },
  { id: "skyline-silver", zh: "天际银幕", en: "Skyline Silver", motif: "blueprint", layout: "dream-banner", mode: "light", colors: ["#f2f5f8", "#ccd6e0", "#58728e", "#8da7c0"], tagline: "用城市般清楚的层级组织工作。", description: "银灰天际线、蓝灰网格与冷白面板构成的现代商务主题。", tags: ["银灰", "城市", "商务", "现代"] },
  { id: "plum-paper-stack", zh: "梅紫纸堆", en: "Plum Paper Stack", motif: "paper", layout: "paper-board", mode: "light", colors: ["#f8f0f6", "#dfc5d7", "#8e4f75", "#c48b68"], tagline: "把散乱信息叠成一套温柔秩序。", description: "梅紫纸张、暖棕标签与错落便签组成的编辑工作板。", tags: ["梅紫", "纸张", "编辑", "秩序"] },
  { id: "ocean-ribbon", zh: "海蓝丝带", en: "Ocean Ribbon", motif: "ribbons", layout: "silk-scroll", mode: "light", colors: ["#eef9fb", "#bfe4ea", "#2588a1", "#6a79c9"], tagline: "让工作流像丝带一样连续展开。", description: "海蓝渐变丝带、清爽纸面与卷轴布局组成的流畅主题。", tags: ["海蓝", "丝带", "卷轴", "流畅"] },
  { id: "pixel-messenger", zh: "像素信使", en: "Pixel Messenger", motif: "grid", layout: "retro-messenger", mode: "light", colors: ["#eaf5ff", "#b7d8f2", "#2778b9", "#f2b84b"], tagline: "用熟悉的窗口感快速回到工作状态。", description: "浅蓝窗口、像素网格与暖黄提示组成的轻复古消息主题。", tags: ["像素", "复古", "消息", "窗口"] },
];

const LIQUID_PROFILES = {
  "liquid-aqua-lens": { heroFocusX: .68, wallpaperOpacity: .58, wallpaperBlur: 1, decoration: .54, particles: .04, aurora: .22, glow: .12, noise: .01, grid: .03, float: .08 },
  "liquid-orchid-prism": { heroFocusX: .63, wallpaperOpacity: .72, wallpaperBlur: 1, decoration: .58, particles: .05, aurora: .28, glow: .24, noise: .02, grid: .04, float: .10 },
  "liquid-sunrise-gel": { heroFocusX: .60, wallpaperOpacity: .60, wallpaperBlur: 1, decoration: .50, particles: .03, aurora: .18, glow: .12, noise: .008, grid: .02, float: .06 },
  "liquid-graphite-orbit": { heroFocusX: .58, wallpaperOpacity: .50, wallpaperBlur: 0, decoration: .42, particles: .02, aurora: .12, glow: .15, noise: .012, grid: .02, float: .04 },
  "liquid-mint-capsule": { heroFocusX: .65, wallpaperOpacity: .56, wallpaperBlur: 1, decoration: .50, particles: .03, aurora: .20, glow: .10, noise: .008, grid: .02, float: .06 },
  "liquid-coral-spectrum": { heroFocusX: .66, wallpaperOpacity: .70, wallpaperBlur: 1, decoration: .62, particles: .06, aurora: .26, glow: .26, noise: .018, grid: .03, float: .10 },
  "liquid-arctic-pearl": { heroFocusX: .58, wallpaperOpacity: .48, wallpaperBlur: 0, decoration: .40, particles: .02, aurora: .14, glow: .08, noise: .006, grid: .01, float: .04 },
  "liquid-midnight-wave": { heroFocusX: .64, wallpaperOpacity: .74, wallpaperBlur: 1, decoration: .64, particles: .08, aurora: .30, glow: .28, noise: .02, grid: .04, float: .12 },
};

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
const clamp = (value, min = 0, max = 255) => Math.max(min, Math.min(max, value));
const hexRgb = (hex) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  return [Number.parseInt(normalized.slice(0, 2), 16), Number.parseInt(normalized.slice(2, 4), 16), Number.parseInt(normalized.slice(4, 6), 16)];
};
const mix = (a, b, t) => {
  const aa = hexRgb(a); const bb = hexRgb(b);
  return `#${aa.map((v, index) => Math.round(clamp(v + (bb[index] - v) * t)).toString(16).padStart(2, "0")).join("")}`;
};
const rgba = (hex, alpha) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${alpha})`; };
const seedFrom = (text) => [...text].reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
const randomFor = (text) => { let state = seedFrom(text); return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; }; };

function motifMarkup(theme, width, height) {
  const [c0, c1, c2, c3] = theme.colors;
  const rand = randomFor(theme.id);
  const shapes = [];
  const pct = (x, total) => Math.round(x * total);

  if (theme.motif === "liquid") {
    for (let index = 0; index < 7; index += 1) {
      const x = pct(0.12 + rand() * 0.76, width);
      const y = pct(0.08 + rand() * 0.78, height);
      const w = pct(0.13 + rand() * 0.22, width);
      const h = pct(0.12 + rand() * 0.24, height);
      const color = index % 2 ? c2 : c3;
      shapes.push(`<g transform="rotate(${Math.round(-24 + rand() * 48)} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${Math.round(Math.min(w,h) * .48)}" fill="${rgba(color, theme.mode === "dark" ? .23 : .28)}" stroke="${rgba("#ffffff", theme.mode === "dark" ? .38 : .76)}" stroke-width="2" filter="url(#softShadow)"/><ellipse cx="${x - w * .13}" cy="${y - h * .16}" rx="${w * .22}" ry="${h * .16}" fill="${rgba("#ffffff", .28)}" filter="url(#blur12)"/></g>`);
    }
    shapes.push(`<path d="M ${-width * .08} ${height * .78} C ${width * .22} ${height * .48}, ${width * .55} ${height * 1.06}, ${width * 1.08} ${height * .54}" fill="none" stroke="${rgba(c3,.34)}" stroke-width="${height*.12}" stroke-linecap="round" filter="url(#blur28)"/>`);
  } else if (["grid", "blueprint", "terminal"].includes(theme.motif)) {
    shapes.push(`<rect width="100%" height="100%" fill="url(#gridPattern)" opacity="${theme.motif === "blueprint" ? .33 : .2}"/>`);
    for (let index = 0; index < 8; index += 1) {
      const x1 = pct(rand(), width); const y1 = pct(rand(), height); const x2 = pct(rand(), width); const y2 = pct(rand(), height);
      shapes.push(`<path d="M${x1} ${y1} L${x2} ${y1} L${x2} ${y2}" fill="none" stroke="${rgba(index % 2 ? c2 : c3,.34)}" stroke-width="${1 + rand()*2}"/>`);
      shapes.push(`<circle cx="${x2}" cy="${y2}" r="${3 + rand()*5}" fill="${rgba(c3,.72)}"/>`);
    }
  } else if (["ribbons", "waves"].includes(theme.motif)) {
    for (let index = 0; index < 6; index += 1) {
      const y = height * (.12 + index * .15);
      const amp = height * (.12 + rand() * .12);
      shapes.push(`<path d="M ${-width*.08} ${y} C ${width*.24} ${y-amp}, ${width*.48} ${y+amp}, ${width*.72} ${y} S ${width*1.02} ${y-amp*.4}, ${width*1.1} ${y+amp*.2}" fill="none" stroke="${rgba(index%2?c2:c3,.16 + index*.035)}" stroke-width="${24 + index*9}" stroke-linecap="round" filter="url(#blur12)"/>`);
    }
  } else if (theme.motif === "aurora") {
    for (let index = 0; index < 5; index += 1) {
      const y = height * (.2 + index*.12);
      shapes.push(`<path d="M ${-width*.1} ${y} Q ${width*.22} ${height*(.02+rand()*.3)} ${width*.5} ${y+height*.12} T ${width*1.1} ${y-height*.06}" fill="none" stroke="${rgba(index%2?c2:c3,.26)}" stroke-width="${70-index*8}" stroke-linecap="round" filter="url(#blur28)"/>`);
    }
  } else if (["paper", "mosaic"].includes(theme.motif)) {
    for (let index = 0; index < 12; index += 1) {
      const x = pct(.04 + rand()*.88,width), y=pct(.04+rand()*.84,height), w=pct(.06+rand()*.16,width), h=pct(.08+rand()*.2,height);
      const color=[c0,c1,c2,c3][index%4];
      shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${theme.motif === "paper" ? 18 : 42}" transform="rotate(${Math.round(-12+rand()*24)} ${x+w/2} ${y+h/2})" fill="${rgba(color,theme.mode==="dark"?.34:.42)}" stroke="${rgba("#ffffff",.42)}" filter="url(#softShadow)"/>`);
    }
  } else if (["orbit", "minimal"].includes(theme.motif)) {
    const cx=width*(.62+rand()*.16), cy=height*(.42+rand()*.14);
    for(let index=0;index<6;index+=1){const r=Math.min(width,height)*(.09+index*.075); shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${rgba(index%2?c2:c3,.14+index*.025)}" stroke-width="${2+index*1.4}"/>`);}
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${Math.min(width,height)*.16}" fill="${rgba(c2,.24)}" filter="url(#blur28)"/>`);
  } else if (theme.motif === "sunset") {
    shapes.push(`<circle cx="${width*.68}" cy="${height*.38}" r="${height*.22}" fill="${rgba(c3,.72)}" filter="url(#softShadow)"/>`);
    for(let index=0;index<5;index+=1){const y=height*(.62+index*.08); shapes.push(`<path d="M0 ${y} Q ${width*.28} ${y-height*.1} ${width*.5} ${y} T ${width} ${y-height*.03} V${height} H0Z" fill="${rgba(index%2?c1:c2,.18+index*.055)}"/>`);}
  } else if (theme.motif === "topography") {
    for(let index=0;index<13;index+=1){const inset=index*22; shapes.push(`<rect x="${width*.16+inset}" y="${height*.1+inset*.45}" width="${width*.72-inset*1.7}" height="${height*.72-inset*.8}" rx="${80+index*7}" fill="none" stroke="${rgba(index%2?c2:c3,.12+index*.012)}" stroke-width="2" transform="rotate(-8 ${width*.52} ${height*.48})"/>`);}
  } else if (theme.motif === "petals") {
    for(let index=0;index<30;index+=1){const x=pct(rand(),width),y=pct(rand(),height),s=8+rand()*25; shapes.push(`<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s*.42}" transform="rotate(${rand()*180} ${x} ${y})" fill="${rgba(index%2?c2:c3,.22+rand()*.25)}"/>`);}
  }
  return shapes.join("\n");
}

function sceneSvg(theme, width, height, preview = false) {
  const [c0,c1,c2,c3]=theme.colors;
  const dark=theme.mode === "dark";
  const baseA=dark ? mix(c0,"#000000",.16) : c0;
  const baseB=dark ? c1 : mix(c1,"#ffffff",.24);
  const motif=motifMarkup(theme,width,height);
  const panel=dark ? rgba(mix(c1,"#ffffff",.12),.62) : rgba("#ffffff",.66);
  const panelStrong=dark ? rgba(mix(c1,"#ffffff",.18),.8) : rgba("#ffffff",.84);
  const ink=dark ? "#f7fbff" : "#172033";
  const muted=dark ? "#aeb9c8" : "#627083";
  const chrome=preview ? `
    <g filter="url(#frameShadow)">
      <rect x="${width*.055}" y="${height*.075}" width="${width*.89}" height="${height*.85}" rx="${height*.055}" fill="${panel}" stroke="${rgba("#ffffff",dark?.24:.72)}" stroke-width="2"/>
      <rect x="${width*.055}" y="${height*.075}" width="${width*.19}" height="${height*.85}" rx="${height*.055}" fill="${panelStrong}"/>
      <path d="M${width*.245} ${height*.075}V${height*.925}" stroke="${rgba(ink,.12)}"/>
      <circle cx="${width*.09}" cy="${height*.13}" r="${height*.012}" fill="${c2}"/>
      <circle cx="${width*.12}" cy="${height*.13}" r="${height*.012}" fill="${c3}"/>
      <rect x="${width*.085}" y="${height*.20}" width="${width*.12}" height="${height*.035}" rx="${height*.016}" fill="${rgba(c2,.22)}"/>
      ${[.29,.37,.45,.57,.65].map((y,i)=>`<rect x="${width*.088}" y="${height*y}" width="${width*(.08+(i%3)*.018)}" height="${height*.018}" rx="${height*.009}" fill="${rgba(i===0?c2:muted,i===0?.72:.34)}"/>`).join("")}
      <rect x="${width*.29}" y="${height*.145}" width="${width*.24}" height="${height*.035}" rx="${height*.017}" fill="${rgba(ink,.84)}"/>
      <rect x="${width*.29}" y="${height*.205}" width="${width*.46}" height="${height*.018}" rx="${height*.009}" fill="${rgba(muted,.42)}"/>
      <rect x="${width*.29}" y="${height*.245}" width="${width*.32}" height="${height*.018}" rx="${height*.009}" fill="${rgba(muted,.28)}"/>
      ${[0,1,2].map((i)=>`<g><rect x="${width*(.29+i*.205)}" y="${height*.34}" width="${width*.175}" height="${height*.22}" rx="${height*.035}" fill="${panelStrong}" stroke="${rgba("#ffffff",dark?.16:.65)}"/><circle cx="${width*(.33+i*.205)}" cy="${height*.405}" r="${height*.026}" fill="${rgba(i===1?c3:c2,.82)}"/><rect x="${width*(.31+i*.205)}" y="${height*.475}" width="${width*.11}" height="${height*.016}" rx="8" fill="${rgba(ink,.55)}"/><rect x="${width*(.31+i*.205)}" y="${height*.515}" width="${width*.085}" height="${height*.012}" rx="6" fill="${rgba(muted,.36)}"/></g>`).join("")}
      <rect x="${width*.29}" y="${height*.68}" width="${width*.59}" height="${height*.13}" rx="${height*.045}" fill="${panelStrong}" stroke="${rgba(c2,.36)}"/>
      <rect x="${width*.325}" y="${height*.735}" width="${width*.31}" height="${height*.016}" rx="8" fill="${rgba(muted,.35)}"/>
      <circle cx="${width*.835}" cy="${height*.745}" r="${height*.035}" fill="${c2}"/>
      <text x="${width*.29}" y="${height*.875}" font-family="Segoe UI,Arial,sans-serif" font-size="${height*.04}" font-weight="700" fill="${ink}" letter-spacing="1">${escapeXml(theme.en.toUpperCase())}</text>
    </g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${baseA}"/><stop offset=".55" stop-color="${baseB}"/><stop offset="1" stop-color="${mix(c2,c3,.36)}"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${rgba(c3,.48)}"/><stop offset="1" stop-color="${rgba(c3,0)}"/></radialGradient>
    <pattern id="gridPattern" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="${rgba(c3,.34)}" stroke-width="1"/></pattern>
    <filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="blur28"><feGaussianBlur stdDeviation="28"/></filter>
    <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000" flood-opacity="${dark?.28:.13}"/></filter>
    <filter id="frameShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="22" stdDeviation="32" flood-color="#000" flood-opacity="${dark?.36:.16}"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <ellipse cx="${width*.82}" cy="${height*.12}" rx="${width*.34}" ry="${height*.4}" fill="url(#glow)" filter="url(#blur28)"/>
  ${motif}
  <rect width="100%" height="100%" fill="none" stroke="${rgba("#ffffff",dark?.08:.3)}" stroke-width="2"/>
  ${chrome}
  </svg>`;
}

function makePalette(theme, dark) {
  const [c0,c1,c2,c3]=theme.colors;
  if (dark) {
    const background=theme.mode === "dark" ? mix(c0,"#000000",.12) : mix(c2,"#000000",.82);
    return { background, panel: mix(background,"#ffffff",.075), panelAlt: mix(background,"#ffffff",.12), surface: mix(background,"#ffffff",.095), text: "#f5f8ff", muted: "#a7b1c2", border: rgba(c3,.25), accent: c2, accentAlt: c3, secondary: mix(c2,c3,.56), highlight: mix(c3,"#ffffff",.18) };
  }
  const background=theme.mode === "light" ? mix(c0,"#ffffff",.12) : mix(c2,"#ffffff",.89);
  return { background, panel: "#ffffff", panelAlt: mix(c1,"#ffffff",.68), surface: mix(c0,"#ffffff",.3), text: "#172033", muted: "#657083", border: rgba(mix(c2,"#243047",.38),.22), accent: mix(c2,"#000000",.08), accentAlt: mix(c3,"#000000",.06), secondary: mix(c2,c3,.52), highlight: c3 };
}

function manifest(theme) {
  const liquid=theme.motif === "liquid";
  const liquidProfile=LIQUID_PROFILES[theme.id] ?? {};
  const layoutHeroHeight = theme.layout === "minimal-focus" ? 280 : theme.layout === "full-canvas" ? 360 : 330;
  return {
    schemaVersion: 2,
    uuid: `collection-${theme.id}`,
    id: theme.id,
    version: liquid ? "1.1.0" : "1.0.0",
    minEngineVersion: "2.0.0",
    galleryVisible: true,
    name: `${theme.zh} ${theme.en}`,
    description: theme.description,
    tagline: theme.tagline,
    tags: theme.tags,
    hero: "hero.webp",
    wallpaper: "hero.webp",
    preview: "preview.webp",
    light: makePalette(theme,false),
    dark: makePalette(theme,true),
    layout: theme.layout,
    heroFit: "cover",
    heroFocusX: liquidProfile.heroFocusX ?? (liquid ? .68 : .62),
    heroFocusY: .44,
    heroZoom: 1,
    heroHeight: layoutHeroHeight,
    heroTextAlign: theme.layout === "minimal-focus" ? "center" : "left",
    heroScrim: theme.mode === "dark" ? .28 : .16,
    wallpaperEnabled: true,
    wallpaperFocusX: .62,
    wallpaperFocusY: .44,
    wallpaperOpacity: liquidProfile.wallpaperOpacity ?? (theme.mode === "dark" ? .78 : .68),
    wallpaperBlur: liquidProfile.wallpaperBlur ?? (liquid ? 1 : 0),
    radius: liquid ? "xl" : (["terminal-grid","retro-messenger"].includes(theme.layout) ? "sm" : "lg"),
    density: theme.layout === "minimal-focus" ? "spacious" : theme.layout === "terminal-grid" ? "compact" : "normal",
    fontPreset: theme.layout === "terminal-grid" ? "mono" : liquid ? "rounded" : "system",
    glass: liquid || ["cinematic-live","full-canvas"].includes(theme.layout),
    shadow: theme.layout === "minimal-focus" ? "sm" : liquid ? "lg" : "md",
    decoration: liquidProfile.decoration ?? (liquid ? .62 : .48),
    effects: {
      particles: liquidProfile.particles ?? (["aurora","petals","waves"].includes(theme.motif) ? .22 : .07),
      aurora: liquidProfile.aurora ?? (["aurora","ribbons","waves","liquid"].includes(theme.motif) ? .34 : .08),
      glow: liquidProfile.glow ?? (theme.mode === "dark" ? .32 : .17),
      noise: liquidProfile.noise ?? (theme.mode === "dark" ? .035 : .018),
      grid: liquidProfile.grid ?? (["grid","blueprint","terminal"].includes(theme.motif) ? .34 : .06),
      float: liquidProfile.float ?? (liquid ? .14 : .06),
    },
    brandSubtitle: liquid ? "LIQUID GLASS COLLECTION" : `${theme.en.toUpperCase()} · CODEX-UI`,
    projectPrefix: "当前项目 · ",
    projectLabel: "选择工作项目",
    statusText: liquid ? "OPTICAL LAYER · READY" : "WORKSPACE · READY",
    quote: theme.tagline,
  };
}

await fs.mkdir(presetsRoot,{recursive:true});
for (const theme of THEMES) {
  const dir=path.join(presetsRoot,theme.id);
  await fs.mkdir(dir,{recursive:true});
  await sharp(Buffer.from(sceneSvg(theme,1600,1000,false))).webp({quality:86,effort:5}).toFile(path.join(dir,"hero.webp"));
  await sharp(Buffer.from(sceneSvg(theme,720,450,true))).webp({quality:84,effort:5}).toFile(path.join(dir,"preview.webp"));
  await fs.writeFile(path.join(dir,"theme.json"),`${JSON.stringify(manifest(theme),null,2)}\n`,"utf8");
}

console.log(`Generated ${THEMES.length} expanded Codex-UI themes.`);
console.log(`Liquid glass themes: ${THEMES.filter((theme)=>theme.motif === "liquid").length}.`);

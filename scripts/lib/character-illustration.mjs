const ROLE_MAP = {
  "liquid-aqua-lens": ["潮汐术士", "TIDE ORACLE", "caster"],
  "liquid-orchid-prism": ["棱镜魔女", "PRISM WITCH", "caster"],
  "liquid-sunrise-gel": ["晨光炼金师", "DAWN ALCHEMIST", "alchemist"],
  "liquid-graphite-orbit": ["轨道守卫", "ORBIT SENTINEL", "knight"],
  "liquid-mint-capsule": ["薄荷医师", "MINT MEDIC", "medic"],
  "liquid-coral-spectrum": ["珊瑚决斗者", "CORAL DUELIST", "blade"],
  "liquid-arctic-pearl": ["极地学者", "FROST SCHOLAR", "scholar"],
  "liquid-midnight-wave": ["深渊领航员", "ABYSS NAVIGATOR", "captain"],
  "cobalt-blueprint": ["蓝图工程师", "BLUEPRINT ENGINEER", "engineer"],
  "matcha-notebook": ["森语书记官", "FOREST SCRIBE", "scholar"],
  "noir-command": ["零号特工", "ZERO AGENT", "agent"],
  "sakura-workbench": ["樱刃锻造师", "SAKURA SMITH", "blade"],
  "desert-solar": ["日轮游侠", "SOLAR RANGER", "ranger"],
  "forest-signal": ["森林守望者", "FOREST WARDEN", "ranger"],
  "cyber-lime-grid": ["青柠骇客", "LIME HACKER", "agent"],
  "jade-terminal": ["翡翠武僧", "JADE MONK", "monk"],
  "lavender-focus": ["紫梦战略家", "DREAM STRATEGIST", "scholar"],
  "copper-circuit": ["铜芯机关师", "CIRCUIT ARTIFICER", "engineer"],
  "cloud-white-space": ["云端档案官", "SKY ARCHIVIST", "scholar"],
  "candy-pop-lab": ["糖果炼金师", "CANDY ALCHEMIST", "alchemist"],
  "midnight-violet": ["午夜幻舞者", "VOID DANCER", "dancer"],
  "marine-depth": ["深海舰长", "DEEPSEA CAPTAIN", "captain"],
  "arctic-blueprint": ["极光机械师", "POLAR MECHANIC", "engineer"],
  "rose-quartz-desk": ["蔷薇战术师", "ROSE TACTICIAN", "agent"],
  "volcanic-signal": ["熔火先锋", "FLAME VANGUARD", "knight"],
  "skyline-silver": ["银幕都市骑士", "SKYLINE KNIGHT", "knight"],
  "plum-paper-stack": ["梅影编辑官", "PLUM EDITOR", "scholar"],
  "ocean-ribbon": ["海潮吟游者", "OCEAN BARD", "dancer"],
  "pixel-messenger": ["像素信使", "PIXEL COURIER", "courier"],
  "porcelain-minimal": ["白瓷剑士", "PORCELAIN BLADE", "blade"],
  "obsidian-gold": ["黑金审判者", "OBSIDIAN JUDGE", "knight"],
  "nebula-ink": ["星云画师", "NEBULA ARTIST", "caster"],
  "terracotta-studio": ["陶土造物师", "TERRACOTTA MAKER", "engineer"],
  "sunrise-canvas": ["朝霞绘梦师", "SUNRISE DREAMER", "caster"],
  "monochrome-editor": ["单色侦探", "MONO DETECTIVE", "agent"],
};

const SKIN_TONES = ["#f5cfb7", "#eebf9f", "#d99b75", "#b97858", "#8f5a45"];
const HAIR_STYLES = ["bob", "long", "pony", "spike", "wave"];

const seedFrom = (text) => [...text].reduce((acc, char) => ((acc * 33) ^ char.charCodeAt(0)) >>> 0, 2166136261);
const randomFor = (text) => {
  let state = seedFrom(text);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};
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
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);

function hairMarkup(style, hair, accent) {
  const back = {
    bob: `<path d="M151 210Q150 76 250 64Q350 76 349 214L325 290Q290 260 250 260Q207 260 174 292Z" fill="${hair}"/>`,
    long: `<path d="M145 214Q146 68 250 58Q356 70 354 220L374 522Q323 552 292 472L250 292L208 472Q173 552 126 518Z" fill="${hair}"/>`,
    pony: `<path d="M154 210Q154 70 251 61Q346 74 348 215L322 284Q286 252 250 254Q210 256 176 288Z" fill="${hair}"/><path d="M326 114Q430 128 394 324Q362 260 309 226Z" fill="${mix(hair, accent, .18)}"/>`,
    spike: `<path d="M158 210L142 92L195 118L218 45L254 105L301 41L314 112L372 88L344 224L318 288L250 256L180 289Z" fill="${hair}"/>`,
    wave: `<path d="M146 214Q137 101 203 68Q266 28 329 84Q379 129 350 238Q385 330 322 482Q329 383 286 286L250 258L209 289Q177 374 181 487Q112 367 150 274Z" fill="${hair}"/>`,
  }[style];
  return `${back}<path d="M171 154Q192 61 254 76Q319 68 337 164Q305 137 272 132Q226 153 171 154Z" fill="${mix(hair, "#ffffff", .12)}" opacity=".88"/>`;
}

function accessoryMarkup(kind, c2, c3, ink) {
  switch (kind) {
    case "blade": return `<g transform="rotate(-12 404 420)"><rect x="397" y="174" width="14" height="370" rx="7" fill="${rgba(c3,.88)}"/><rect x="389" y="188" width="30" height="286" rx="15" fill="url(#charBlade)" filter="url(#charGlow)"/><path d="M368 468H438L425 490H381Z" fill="${ink}"/><rect x="394" y="486" width="18" height="92" rx="8" fill="${mix(ink,c2,.25)}"/></g>`;
    case "ranger": return `<g fill="none" stroke="${c3}" stroke-width="10" stroke-linecap="round"><path d="M404 220Q470 370 402 548"/><path d="M408 224L407 546" stroke-width="3" opacity=".8"/></g><path d="M404 228L368 330L417 307Z" fill="${c2}" filter="url(#charGlow)"/>`;
    case "engineer": return `<g transform="translate(368 304)"><rect width="116" height="164" rx="20" fill="${rgba(ink,.82)}" stroke="${rgba(c3,.8)}" stroke-width="5"/><rect x="14" y="18" width="88" height="76" rx="12" fill="${rgba(c2,.24)}"/><path d="M30 118H86M30 139H72" stroke="${c3}" stroke-width="7" stroke-linecap="round"/><circle cx="84" cy="139" r="11" fill="${c2}"/></g><path d="M429 202L458 174L474 189L448 220Z" fill="${c3}"/>`;
    case "caster": return `<g><path d="M416 184L432 573" stroke="${mix(ink,c2,.2)}" stroke-width="17" stroke-linecap="round"/><circle cx="414" cy="168" r="43" fill="${rgba(c2,.18)}" stroke="${c3}" stroke-width="7" filter="url(#charGlow)"/><path d="M414 132L427 160L456 166L432 185L438 216L414 201L389 216L396 185L372 166L402 160Z" fill="${c2}"/></g>`;
    case "alchemist": return `<g transform="translate(375 300)"><path d="M26 0H78V36L112 114Q126 150 91 163H13Q-22 150-8 114L26 36Z" fill="${rgba(c3,.38)}" stroke="${c3}" stroke-width="7"/><path d="M2 111Q54 75 104 113V145H0Z" fill="${rgba(c2,.82)}"/><circle cx="31" cy="101" r="10" fill="#fff" opacity=".75"/><circle cx="78" cy="125" r="7" fill="#fff" opacity=".65"/></g>`;
    case "medic": return `<g transform="translate(372 298)"><rect width="112" height="154" rx="26" fill="${rgba("#ffffff",.86)}" stroke="${c3}" stroke-width="6"/><path d="M56 35V119M14 77H98" stroke="${c2}" stroke-width="24" stroke-linecap="round"/><circle cx="88" cy="24" r="12" fill="${c3}"/></g>`;
    case "knight": return `<g transform="translate(362 265)"><path d="M58 0Q121 25 122 96Q119 191 58 235Q-3 192-6 96Q-3 25 58 0Z" fill="${rgba(ink,.86)}" stroke="${c3}" stroke-width="7"/><path d="M58 24V207M15 84H104" stroke="${rgba(c2,.76)}" stroke-width="12"/><circle cx="58" cy="99" r="28" fill="${c2}" filter="url(#charGlow)"/></g>`;
    case "captain": return `<g transform="translate(378 305)"><circle cx="53" cy="53" r="52" fill="${rgba(ink,.82)}" stroke="${c3}" stroke-width="7"/><circle cx="53" cy="53" r="33" fill="none" stroke="${rgba(c2,.7)}" stroke-width="4"/><path d="M53 14L66 51L53 91L40 54Z" fill="${c2}"/><path d="M14 53H92M53 14V92" stroke="${rgba(c3,.6)}" stroke-width="3"/></g>`;
    case "dancer": return `<g fill="none" stroke-linecap="round"><path d="M391 192Q490 268 394 352Q325 416 441 547" stroke="${rgba(c3,.84)}" stroke-width="18" filter="url(#charGlow)"/><path d="M403 207Q462 283 398 345Q356 404 427 522" stroke="${rgba(c2,.9)}" stroke-width="7"/></g>`;
    case "courier": return `<g transform="translate(351 320)"><path d="M12 30Q68-10 126 28L112 155Q66 181 18 154Z" fill="${mix(ink,c2,.18)}" stroke="${c3}" stroke-width="6"/><rect x="30" y="54" width="78" height="57" rx="10" fill="${rgba(c2,.25)}"/><path d="M35 28Q68-47 106 27" fill="none" stroke="${c3}" stroke-width="9"/></g>`;
    case "monk": return `<g><circle cx="414" cy="327" r="74" fill="none" stroke="${rgba(c3,.65)}" stroke-width="7"/><circle cx="414" cy="327" r="44" fill="none" stroke="${rgba(c2,.75)}" stroke-width="4"/><path d="M414 239V415M326 327H502" stroke="${rgba(c3,.45)}" stroke-width="3"/><circle cx="414" cy="327" r="17" fill="${c2}" filter="url(#charGlow)"/></g>`;
    default: return `<g transform="translate(372 300)"><rect width="112" height="150" rx="20" fill="${rgba(ink,.82)}" stroke="${c3}" stroke-width="6"/><path d="M24 44H88M24 75H73M24 106H94" stroke="${c2}" stroke-width="8" stroke-linecap="round"/></g>`;
  }
}

function headgearMarkup(kind, c2, c3, hair, ink) {
  switch (kind) {
    case "engineer": return `<g><path d="M183 151Q250 104 320 151" fill="none" stroke="${mix(ink,c2,.25)}" stroke-width="13"/><circle cx="215" cy="142" r="25" fill="${rgba(c2,.24)}" stroke="${c3}" stroke-width="7"/><circle cx="286" cy="142" r="25" fill="${rgba(c2,.24)}" stroke="${c3}" stroke-width="7"/><path d="M240 142H261" stroke="${c3}" stroke-width="7"/></g>`;
    case "agent": return `<path d="M188 210Q250 174 313 208L303 241Q250 222 198 241Z" fill="${rgba(ink,.72)}" stroke="${c3}" stroke-width="5"/><path d="M207 220H294" stroke="${c2}" stroke-width="7" filter="url(#charGlow)"/>`;
    case "knight": return `<g><path d="M181 166L202 85L235 123L250 66L268 124L303 84L323 166Q252 139 181 166Z" fill="${mix(ink,c2,.18)}" stroke="${c3}" stroke-width="5"/><circle cx="251" cy="116" r="12" fill="${c2}" filter="url(#charGlow)"/></g>`;
    case "captain": return `<g><path d="M174 160Q250 91 330 160L313 190H188Z" fill="${mix(ink,c2,.16)}" stroke="${c3}" stroke-width="5"/><path d="M211 139H290" stroke="${c2}" stroke-width="9"/><circle cx="251" cy="138" r="12" fill="${c3}"/></g>`;
    case "ranger": return `<g><path d="M165 180Q249 102 338 181Q310 142 287 109Q245 136 207 108Q183 143 165 180Z" fill="${mix(hair,c2,.18)}"/><path d="M192 126L174 83L220 112M309 126L329 82L282 111" fill="none" stroke="${c3}" stroke-width="9" stroke-linecap="round"/></g>`;
    case "caster": return `<g><path d="M193 154Q250 104 308 154" fill="none" stroke="${c3}" stroke-width="7"/><path d="M250 92L261 119L290 123L267 141L274 169L250 154L226 169L233 141L210 123L239 119Z" fill="${c2}" filter="url(#charGlow)"/></g>`;
    case "alchemist": return `<g><circle cx="191" cy="155" r="15" fill="${c2}"/><circle cx="214" cy="126" r="9" fill="${c3}"/><path d="M177 172Q205 148 232 178" fill="none" stroke="${mix(hair,c2,.2)}" stroke-width="8"/></g>`;
    case "medic": return `<g transform="translate(279 118)"><rect width="52" height="40" rx="12" fill="${rgba("#ffffff",.9)}" stroke="${c3}" stroke-width="4"/><path d="M26 9V31M15 20H37" stroke="${c2}" stroke-width="8" stroke-linecap="round"/></g>`;
    case "scholar": return `<g fill="none" stroke="${mix(ink,c2,.18)}" stroke-width="6"><circle cx="220" cy="240" r="25"/><circle cx="281" cy="240" r="25"/><path d="M245 240H256"/></g>`;
    case "dancer": return `<g><path d="M168 166Q188 88 236 115Q215 144 211 186Z" fill="${c3}" opacity=".8"/><path d="M332 166Q313 88 266 115Q285 145 291 187Z" fill="${c2}" opacity=".8"/></g>`;
    case "courier": return `<g><path d="M315 189Q352 207 336 257" fill="none" stroke="${mix(ink,c2,.18)}" stroke-width="9"/><circle cx="337" cy="264" r="16" fill="${c3}"/><rect x="325" y="250" width="31" height="19" rx="8" fill="${ink}"/></g>`;
    case "monk": return `<g><circle cx="250" cy="107" r="18" fill="none" stroke="${c3}" stroke-width="7"/><circle cx="219" cy="112" r="10" fill="${c2}"/><circle cx="281" cy="112" r="10" fill="${c2}"/></g>`;
    case "blade": return `<g><path d="M180 172L206 91L247 134L292 88L324 173" fill="none" stroke="${c3}" stroke-width="8" stroke-linecap="round"/><circle cx="251" cy="126" r="10" fill="${c2}"/></g>`;
    default: return "";
  }
}

function outfitDetailMarkup(kind, c2, c3, ink, cloth) {
  const belt = `<path d="M193 612H309" stroke="${mix(ink,c2,.18)}" stroke-width="17"/><rect x="235" y="595" width="31" height="31" rx="8" fill="${c2}" stroke="${c3}" stroke-width="4"/>`;
  switch (kind) {
    case "knight": return `<path d="M178 458L126 488L150 548L205 508M322 458L374 488L350 548L296 508" fill="${mix(cloth,c2,.22)}" stroke="${c3}" stroke-width="5"/><path d="M211 526L250 552L289 526V630L250 662L211 630Z" fill="${rgba(c2,.3)}" stroke="${c3}" stroke-width="5"/>${belt}`;
    case "agent": return `<path d="M204 477L168 605M296 477L333 605" stroke="${rgba(c3,.7)}" stroke-width="10"/><path d="M208 544H292" stroke="${c2}" stroke-width="6" stroke-dasharray="14 10"/>${belt}`;
    case "engineer": return `<path d="M205 470L151 535M294 470L350 535" stroke="${c3}" stroke-width="13"/><circle cx="190" cy="555" r="20" fill="${rgba(c2,.34)}" stroke="${c3}" stroke-width="5"/><circle cx="310" cy="555" r="20" fill="${rgba(c2,.34)}" stroke="${c3}" stroke-width="5"/>${belt}`;
    case "caster": return `<path d="M188 488Q250 540 313 488L296 644Q250 683 204 644Z" fill="${rgba(c2,.22)}" stroke="${c3}" stroke-width="5"/><path d="M250 527L264 554L294 559L272 580L278 612L250 596L222 612L228 580L206 559L236 554Z" fill="${c3}" opacity=".8"/>`;
    case "ranger": return `<path d="M186 480L148 641H201L225 512M314 480L352 641H299L275 512" fill="${mix(cloth,c2,.16)}" stroke="${c3}" stroke-width="5"/>${belt}`;
    case "alchemist": return `<path d="M197 487Q250 519 304 487L320 650H179Z" fill="${rgba(c3,.18)}"/><circle cx="221" cy="565" r="18" fill="${c2}"/><circle cx="280" cy="595" r="13" fill="${c3}"/>${belt}`;
    case "medic": return `<rect x="212" y="526" width="77" height="88" rx="18" fill="${rgba("#ffffff",.82)}" stroke="${c3}" stroke-width="5"/><path d="M250 543V596M226 570H274" stroke="${c2}" stroke-width="14" stroke-linecap="round"/>`;
    case "captain": return `<path d="M197 484L220 648M303 484L280 648" stroke="${c3}" stroke-width="8"/><path d="M214 505H287" stroke="${rgba(c2,.7)}" stroke-width="7" stroke-dasharray="9 8"/>${belt}`;
    case "dancer": return `<path d="M193 507Q250 566 308 507L343 682Q250 724 157 682Z" fill="${rgba(c2,.2)}" stroke="${c3}" stroke-width="5"/><path d="M176 626Q251 587 326 626" fill="none" stroke="${c3}" stroke-width="8"/>`;
    case "courier": return `<path d="M186 496L313 646M314 496L187 646" stroke="${c3}" stroke-width="13"/>${belt}`;
    case "monk": return `<path d="M200 492Q250 531 301 492V656Q250 688 199 656Z" fill="${rgba(c2,.2)}"/><circle cx="250" cy="561" r="30" fill="none" stroke="${c3}" stroke-width="7"/><circle cx="250" cy="561" r="10" fill="${c2}"/>`;
    case "blade": return `<path d="M202 485L174 650H217L250 525L284 650H327L299 485" fill="${rgba(c2,.2)}" stroke="${c3}" stroke-width="5"/>${belt}`;
    default: return belt;
  }
}
export function getCharacterConcept(theme) {
  const fallback = ["界面守护者", "UI GUARDIAN", "agent"];
  const [nameZh, nameEn, archetype] = ROLE_MAP[theme.id] ?? fallback;
  return { nameZh, nameEn, archetype };
}

export function characterMarkup(theme, width, height, { preview = false } = {}) {
  const [c0, c1, c2, c3] = theme.colors;
  const rand = randomFor(`${theme.id}:character`);
  const concept = getCharacterConcept(theme);
  const style = HAIR_STYLES[Math.floor(rand() * HAIR_STYLES.length)];
  const skin = SKIN_TONES[Math.floor(rand() * SKIN_TONES.length)];
  const hair = mix(rand() > .42 ? c1 : c2, theme.mode === "dark" ? "#05060a" : "#312944", .46);
  const ink = theme.mode === "dark" ? "#eef6ff" : "#233047";
  const cloth = mix(c1, theme.mode === "dark" ? "#05070c" : "#ffffff", theme.mode === "dark" ? .22 : .36);
  const clothAlt = mix(c2, c1, .54);
  const eye = rand() > .5 ? c2 : c3;
  const flip = rand() > .5 ? -1 : 1;
  const scale = preview ? height / 780 : height / 900;
  const stageX = preview ? width * .56 : width * .64;
  const stageY = preview ? height * .04 : height * .02;
  const translateX = flip === -1 ? stageX + (500 * scale) : stageX;
  const starPoints = Array.from({ length: preview ? 6 : 12 }, (_, index) => {
    const x = 80 + rand() * 390;
    const y = 60 + rand() * 560;
    const r = 2 + rand() * 5;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${index % 2 ? c2 : c3}" opacity="${(.28 + rand() * .52).toFixed(2)}"/>`;
  }).join("");

  return `<g class="codex-character-stage" transform="translate(${translateX.toFixed(1)} ${stageY.toFixed(1)}) scale(${(scale * flip).toFixed(4)} ${scale.toFixed(4)})">
    <ellipse cx="250" cy="334" rx="222" ry="270" fill="${rgba(c2, theme.mode === "dark" ? .13 : .1)}" stroke="${rgba(c3,.34)}" stroke-width="3"/>
    <ellipse cx="250" cy="334" rx="180" ry="224" fill="none" stroke="${rgba(c3,.24)}" stroke-width="2" stroke-dasharray="10 18"/>
    ${starPoints}
    <g filter="url(#charShadow)">
      ${hairMarkup(style, hair, c3)}
      <path d="M174 703L184 482Q190 400 250 374Q312 400 318 482L330 703Z" fill="${cloth}" stroke="${rgba(c3,.38)}" stroke-width="5"/>
      <path d="M187 482Q250 433 315 482L300 653H201Z" fill="${clothAlt}" opacity=".82"/>
      <path d="M225 374L229 332H271L275 374Q250 398 225 374Z" fill="${skin}"/>
      <ellipse cx="250" cy="225" rx="82" ry="105" fill="${skin}"/>
      <path d="M176 205Q177 104 250 99Q327 107 330 203Q304 168 270 163Q222 184 176 205Z" fill="${hair}"/>
      <path d="M188 203Q196 134 239 121Q203 171 206 244Q190 238 188 203Z" fill="${mix(hair,"#ffffff",.08)}"/>
      ${headgearMarkup(concept.archetype,c2,c3,hair,ink)}
      <path d="M207 233Q222 220 238 232" fill="none" stroke="${mix(hair,"#000000",.25)}" stroke-width="7" stroke-linecap="round"/>
      <path d="M264 232Q280 219 296 233" fill="none" stroke="${mix(hair,"#000000",.25)}" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="224" cy="241" rx="8" ry="11" fill="${eye}" filter="url(#charGlow)"/><ellipse cx="280" cy="241" rx="8" ry="11" fill="${eye}" filter="url(#charGlow)"/>
      <circle cx="221" cy="237" r="2.5" fill="#ffffff"/><circle cx="277" cy="237" r="2.5" fill="#ffffff"/>
      <path d="M250 244L244 270L254 272" fill="none" stroke="${rgba(mix(skin,"#7b443d",.45),.62)}" stroke-width="4" stroke-linecap="round"/>
      <path d="M230 291Q250 304 271 290" fill="none" stroke="${rgba("#8a3e55",.72)}" stroke-width="5" stroke-linecap="round"/>
      <path d="M183 470Q128 512 112 620" fill="none" stroke="${cloth}" stroke-width="42" stroke-linecap="round"/><circle cx="111" cy="626" r="22" fill="${skin}"/>
      <path d="M317 469Q361 488 382 536" fill="none" stroke="${cloth}" stroke-width="42" stroke-linecap="round"/><circle cx="383" cy="542" r="22" fill="${skin}"/>
      <path d="M219 458L250 493L282 457L300 486L250 538L201 487Z" fill="${rgba(c3,.76)}"/>
      <path d="M250 493V652" stroke="${rgba(ink,.28)}" stroke-width="5"/>
      ${outfitDetailMarkup(concept.archetype,c2,c3,ink,cloth)}
      <path d="M191 666L157 785H226L250 701L275 785H345L309 666Z" fill="${mix(cloth,"#000000",.13)}"/>
      ${accessoryMarkup(concept.archetype,c2,c3,ink)}
    </g>
    ${preview ? "" : `<g transform="translate(72 706)">
      <rect width="356" height="62" rx="31" fill="${rgba(theme.mode === "dark" ? "#03060c" : "#ffffff",.78)}" stroke="${rgba(c3,.55)}" stroke-width="3"/>
      <circle cx="32" cy="31" r="15" fill="${c2}" filter="url(#charGlow)"/>
      <text x="61" y="28" font-family="Segoe UI,Arial,sans-serif" font-size="17" font-weight="800" fill="${ink}" letter-spacing="1">${escapeXml(concept.nameEn)}</text>
      <text x="61" y="48" font-family="Microsoft YaHei,Segoe UI,sans-serif" font-size="14" fill="${rgba(ink,.7)}">${escapeXml(concept.nameZh)}</text>
    </g>`}
  </g>`;
}

export function characterDefs(theme) {
  const [, , c2, c3] = theme.colors;
  return `<linearGradient id="charBlade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rgba(c3,0)}"/><stop offset=".45" stop-color="${c3}"/><stop offset="1" stop-color="${rgba(c2,.2)}"/></linearGradient>
  <filter id="charGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="charShadow" x="-40%" y="-30%" width="190%" height="190%"><feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#000000" flood-opacity=".28"/></filter>`;
}

export const CHARACTER_THEME_IDS = Object.freeze(Object.keys(ROLE_MAP));
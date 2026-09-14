import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ChartColumn, a as Tag, c as Plus, d as ImagePlus, f as GripVertical, g as ChevronDown, h as ChevronUp, i as Trash2, l as LayoutTemplate, m as Copy, n as Upload, o as Scan, p as Download, s as RotateCw, t as X, u as Info, v as Camera, y as BookOpen } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as ReferenceLine, c as ResponsiveContainer, i as CartesianGrid, l as Tooltip, n as YAxis, o as Bar, r as XAxis, s as Cell, t as BarChart } from "../_libs/recharts+[...].mjs";
import { t as Uot } from "../_libs/openchemlib.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B7kvOivW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[color,background-color,transform,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent/90",
			secondary: "bg-raised text-fg border border-border hover:bg-raised/80",
			ghost: "text-muted hover:text-fg hover:bg-raised",
			outline: "border border-border bg-transparent text-fg hover:bg-raised"
		},
		size: {
			default: "h-10 px-4 text-sm",
			sm: "h-8 px-3 text-xs",
			icon: "size-9",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function readLib() {
	if (typeof window === "undefined") return null;
	const g = window;
	return g.$3Dmol ?? g["3Dmol"] ?? null;
}
var pending = null;
function load3Dmol() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("3Dmol needs a browser"));
	const existingLib = readLib();
	if (existingLib) return Promise.resolve(existingLib);
	if (pending) return pending;
	pending = new Promise((resolve, reject) => {
		const done = () => {
			const lib = readLib();
			if (lib) resolve(lib);
			else reject(/* @__PURE__ */ new Error("3Dmol loaded without a global"));
		};
		const existing = document.querySelector("script[data-mol-lib='3dmol']") || document.querySelector("script[src*=\"3Dmol-min.js\"]");
		if (existing) {
			if (readLib()) {
				resolve(readLib());
				return;
			}
			existing.addEventListener("load", done);
			existing.addEventListener("error", () => reject(/* @__PURE__ */ new Error("Failed to load 3Dmol")));
			return;
		}
		const script = document.createElement("script");
		script.src = "/vendor/3Dmol-min.js";
		script.async = true;
		script.dataset.molLib = "3dmol";
		script.onload = done;
		script.onerror = () => reject(/* @__PURE__ */ new Error("Failed to load 3Dmol"));
		document.head.appendChild(script);
	});
	return pending;
}
if (typeof window !== "undefined") load3Dmol();
var lastViewer = null;
function setLastViewer(viewer) {
	lastViewer = viewer;
}
function isPngDataUrl(uri) {
	return !!uri && uri.startsWith("data:image/") && uri.length > 800;
}
function canvasToPng(canvas) {
	if (!canvas || canvas.width < 8 || canvas.height < 8) return null;
	try {
		const uri = canvas.toDataURL("image/png");
		return isPngDataUrl(uri) ? uri : null;
	} catch {
		return null;
	}
}
var PAPER_BG = "#faf9f6";
function snapshotViewer() {
	try {
		lastViewer?.spin(false);
		lastViewer?.render();
	} catch {}
	if (lastViewer) try {
		const uri = lastViewer.pngURI();
		if (isPngDataUrl(uri)) return uri;
	} catch {}
	if (typeof document === "undefined") return null;
	const host = document.querySelector("[data-mol-host]");
	const canvases = host ? [...host.querySelectorAll("canvas")] : [];
	for (const canvas of canvases) {
		const uri = canvasToPng(canvas);
		if (uri) return uri;
	}
	return null;
}
function snapshotViewerAsync() {
	try {
		lastViewer?.spin(false);
		lastViewer?.setBackgroundColor?.(PAPER_BG);
		lastViewer?.render();
	} catch {}
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const uri = snapshotViewer();
				try {
					lastViewer?.setBackgroundColor?.(PAPER_BG);
					lastViewer?.render();
				} catch {}
				resolve(uri);
			});
		});
	});
}
async function downloadDataUrl(uri, filename) {
	if (typeof document === "undefined") return;
	let href = uri;
	let revoke = null;
	try {
		const blob = await (await fetch(uri)).blob();
		href = URL.createObjectURL(blob);
		revoke = href;
	} catch {
		href = uri;
	}
	const link = document.createElement("a");
	link.href = href;
	link.download = filename;
	link.rel = "noopener";
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	link.remove();
	if (revoke) window.setTimeout(() => URL.revokeObjectURL(revoke), 2500);
}
var AA3_TO_1 = {
	ALA: "A",
	ARG: "R",
	ASN: "N",
	ASP: "D",
	CYS: "C",
	GLN: "Q",
	GLU: "E",
	GLY: "G",
	HIS: "H",
	ILE: "I",
	LEU: "L",
	LYS: "K",
	MET: "M",
	PHE: "F",
	PRO: "P",
	SER: "S",
	THR: "T",
	TRP: "W",
	TYR: "Y",
	VAL: "V",
	SEC: "U",
	PYL: "O",
	MSE: "M",
	HYP: "P"
};
Object.fromEntries(Object.entries(AA3_TO_1).map(([k, v]) => [v, k]));
var AA_TITLE = {
	ALA: "Ala",
	ARG: "Arg",
	ASN: "Asn",
	ASP: "Asp",
	CYS: "Cys",
	GLN: "Gln",
	GLU: "Glu",
	GLY: "Gly",
	HIS: "His",
	ILE: "Ile",
	LEU: "Leu",
	LYS: "Lys",
	MET: "Met",
	PHE: "Phe",
	PRO: "Pro",
	SER: "Ser",
	THR: "Thr",
	TRP: "Trp",
	TYR: "Tyr",
	VAL: "Val",
	SEC: "Sec",
	PYL: "Pyl",
	MSE: "Mse"
};
var STANDARD_AA = new Set(Object.keys(AA3_TO_1));
var WATER_NAMES = /* @__PURE__ */ new Set([
	"HOH",
	"WAT",
	"H2O",
	"SOL",
	"DOD",
	"TIP",
	"TIP3",
	"OH2"
]);
var ION_NAMES = /* @__PURE__ */ new Set([
	"NA",
	"K",
	"LI",
	"RB",
	"CS",
	"MG",
	"CA",
	"ZN",
	"MN",
	"FE",
	"CU",
	"NI",
	"CO",
	"CD",
	"CL",
	"BR",
	"F",
	"I",
	"IOD",
	"NA+",
	"CL-",
	"SO4",
	"PO4",
	"NH4"
]);
/** Kyte–Doolittle hydropathy. */
var KYTE_DOOLITTLE = {
	ILE: 4.5,
	VAL: 4.2,
	LEU: 3.8,
	PHE: 2.8,
	CYS: 2.5,
	MET: 1.9,
	ALA: 1.8,
	GLY: -.4,
	THR: -.7,
	SER: -.8,
	TRP: -.9,
	TYR: -1.3,
	PRO: -1.6,
	HIS: -3.2,
	GLN: -3.5,
	ASN: -3.5,
	GLU: -3.5,
	ASP: -3.5,
	LYS: -3.9,
	ARG: -4.5,
	MSE: 1.9,
	SEC: 2.5
};
function aaClass(resName) {
	const r = resName.toUpperCase();
	if (WATER_NAMES.has(r)) return "water";
	if (ION_NAMES.has(r)) return "ion";
	if (r === "ASP" || r === "GLU") return "acidic";
	if (r === "LYS" || r === "ARG" || r === "HIS") return "basic";
	if (r === "PHE" || r === "TRP" || r === "TYR") return "aromatic";
	if (r === "SER" || r === "THR" || r === "ASN" || r === "GLN" || r === "CYS" || r === "SEC") return "polar";
	if (r === "GLY" || r === "PRO") return "special";
	if (r === "ALA" || r === "VAL" || r === "LEU" || r === "ILE" || r === "MET" || r === "MSE") return "hydrophobic";
	if (STANDARD_AA.has(r)) return "hydrophobic";
	return "ligand";
}
function aaClassLabel(cls) {
	switch (cls) {
		case "acidic": return "Acidic";
		case "basic": return "Basic";
		case "polar": return "Polar";
		case "aromatic": return "Aromatic";
		case "hydrophobic": return "Hydrophobic";
		case "special": return "Gly / Pro";
		case "ligand": return "Ligand";
		case "water": return "Water";
		case "ion": return "Ion";
		default: return "Other";
	}
}
function prettyResidue(resName, resSeq, chain) {
	return `${AA_TITLE[resName] ?? resName}${resSeq}${chain && chain !== "A" ? `.${chain}` : ""}`;
}
function ssLabel(code) {
	switch (code) {
		case "H": return "α-helix";
		case "G": return "3₁₀-helix";
		case "I": return "π-helix";
		case "E": return "β-strand";
		case "T": return "Turn";
		default: return "Coil";
	}
}
function ssGroup(code) {
	if (code === "H" || code === "G" || code === "I") return "helix";
	if (code === "E") return "sheet";
	if (code === "T") return "turn";
	return "coil";
}
var SIDECHAIN_CHARGE = {
	ASP: {
		OD1: -.5,
		OD2: -.5
	},
	GLU: {
		OE1: -.5,
		OE2: -.5
	},
	LYS: { NZ: 1 },
	ARG: {
		NH1: .33,
		NH2: .33,
		NE: .34
	},
	HIS: {
		ND1: .12,
		NE2: .12
	}
};
function chargeForAtom(resName, atomName, isNTerm, isCTerm) {
	const n = atomName.toUpperCase();
	const r = resName.toUpperCase();
	let q = 0;
	if (isNTerm && n === "N") q += 1;
	if (isCTerm && (n === "OXT" || n === "OT1" || n === "OT2")) q += n === "OXT" ? -1 : -.5;
	const side = SIDECHAIN_CHARGE[r]?.[n];
	if (side) q += side;
	return q;
}
function hydropathy(resName) {
	return KYTE_DOOLITTLE[resName.toUpperCase()] ?? 0;
}
function rwbColor(value, lo, hi) {
	const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo || 1)));
	if (t < .5) {
		const u = t * 2;
		return rgbHex(201 + 43 * u, 120 + 121 * u, 120 + 114 * u);
	}
	const u = (t - .5) * 2;
	return rgbHex(244 + -122 * u, 241 + -83 * u, 234 + -22 * u);
}
function hydroColor(value) {
	const t = Math.max(0, Math.min(1, (value + 4.5) / 9));
	return rgbHex(90 + 142 * t, 168 + -8 * t, 160 + -16 * t);
}
function rgbHex(r, g, b) {
	const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
	return `#${h(r)}${h(g)}${h(b)}`;
}
var POSE_PALETTE = [
	"#d6d3d1",
	"#2dd4bf",
	"#e8a090",
	"#8ab4f8",
	"#c4b5a5",
	"#7dd3c0",
	"#b9a089"
];
var CPK = {
	C: "#9098a4",
	N: "#5b8def",
	O: "#e07070",
	S: "#d4c48a",
	P: "#e8a090",
	F: "#6aaa8c",
	CL: "#6aaa8c",
	BR: "#e8a090",
	I: "#b492c8",
	H: "#d6d3d1"
};
/** Docking-engine detection, ligand identity, and affinity chart model. */
var ENGINE_HINTS = [
	{
		id: "GNINA",
		pattern: /gnina|cnn[_\s-]?affinity/i
	},
	{
		id: "smina",
		pattern: /smina/i
	},
	{
		id: "AutoDock Vina",
		pattern: /vina/i
	},
	{
		id: "AutoDock",
		pattern: /autodock|estimated free energy of binding/i
	},
	{
		id: "Glide",
		pattern: /glide|glidescore/i
	},
	{
		id: "GOLD",
		pattern: /gold\.plp|goldscore|\bgold\b/i
	},
	{
		id: "DiffDock",
		pattern: /diffdock/i
	},
	{
		id: "Uni-Dock",
		pattern: /unidock|uni-dock/i
	},
	{
		id: "rDock",
		pattern: /rdock/i
	},
	{
		id: "PLANTS",
		pattern: /plants/i
	},
	{
		id: "LeDock",
		pattern: /ledock/i
	},
	{
		id: "MOE",
		pattern: /\bmoe\b|gbvi/i
	}
];
var ENGINE_OPTIONS = ENGINE_HINTS.map((hint) => hint.id);
function detectEngine(filename, remarks = "") {
	for (const hint of ENGINE_HINTS) if (hint.pattern.test(filename)) return hint.id;
	for (const hint of ENGINE_HINTS) if (hint.pattern.test(remarks)) return hint.id;
	return "Unknown";
}
var AFFINITY_PATTERNS = [
	{
		engines: ["AutoDock Vina", "smina"],
		pattern: /vina result:\s*(-?\d+(?:\.\d+)?)/i
	},
	{
		engines: ["Glide"],
		pattern: /glidescore\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i
	},
	{
		engines: ["AutoDock"],
		pattern: /estimated free energy of binding\s*=\s*(-?\d+(?:\.\d+)?)/i
	},
	{ pattern: /affinity\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
	{ pattern: /binding energy\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
	{ pattern: /delta[_ ]?g\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
	{ pattern: /score\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*kcal/i },
	{ pattern: /REMARK\s+(-?\d+\.\d+)\s*$/m }
];
function parseAffinityText(text, engine) {
	const preferred = engine ? AFFINITY_PATTERNS.filter((item) => item.engines?.includes(engine)) : [];
	const rest = AFFINITY_PATTERNS.filter((item) => !preferred.includes(item));
	for (const item of [...preferred, ...rest]) {
		const match = text.match(item.pattern);
		if (match) {
			const value = Number.parseFloat(match[1]);
			if (Number.isFinite(value)) return value;
		}
	}
	return null;
}
function compactId(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var LIGAND_ALIASES = [
	{
		name: "OX-11",
		tokens: ["ox11"]
	},
	{
		name: "T2Z14",
		tokens: ["t2z14"]
	},
	{
		name: "Avibactam",
		tokens: ["avibactam", "nxl"]
	},
	{
		name: "GDP",
		tokens: ["gdp"]
	},
	{
		name: "Trimethoprim",
		tokens: ["trimethoprim"]
	},
	{
		name: "Triclosan",
		tokens: ["triclosan"]
	}
];
function canonicalLigandName(filename, fallback) {
	const compact = compactId(`${filename} ${fallback}`);
	for (const alias of LIGAND_ALIASES) if (alias.tokens.some((token) => compact.includes(compactId(token)))) return alias.name;
	const trimmed = fallback.trim();
	if (trimmed && trimmed.toUpperCase() !== "UNL" && trimmed.toUpperCase() !== "LIG") return trimmed;
	return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || trimmed;
}
function matchLigandToExisting(filename, fallback, existing) {
	const incoming = canonicalLigandName(filename, fallback);
	const incomingKey = compactId(incoming);
	for (const pose of existing) if ([
		compactId(pose.display),
		compactId(pose.fallbackLabel),
		compactId(canonicalLigandName(pose.filename, pose.fallbackLabel))
	].includes(incomingKey)) return pose.display;
	return incoming;
}
function buildAffinityChart(poses) {
	const ligandOrder = [];
	const ligandLabel = {};
	const engines = [];
	for (const pose of poses) {
		const key = compactId(pose.ligand) || pose.ligand;
		if (!ligandLabel[key]) {
			ligandLabel[key] = pose.ligand;
			ligandOrder.push(key);
		}
		const engine = pose.engine.trim() || "Unknown";
		if (!engines.includes(engine)) engines.push(engine);
	}
	const rows = ligandOrder.map((key) => {
		const row = { ligand: ligandLabel[key] };
		for (const engine of engines) {
			const hits = poses.filter((p) => (compactId(p.ligand) || p.ligand) === key && (p.engine.trim() || "Unknown") === engine && p.affinity !== null && Number.isFinite(p.affinity));
			row[engine] = hits.length ? Math.min(...hits.map((h) => h.affinity)) : null;
		}
		return row;
	});
	const scored = poses.filter((p) => p.affinity !== null && Number.isFinite(p.affinity)).length;
	return {
		rows,
		engines,
		ligands: ligandOrder.map((key) => ligandLabel[key]),
		scored
	};
}
var ENGINE_PALETTE = [
	"#d6d3d1",
	"#2dd4bf",
	"#e8a090",
	"#8ab4f8",
	"#c4b5a5",
	"#7dd3c0",
	"#b9a089"
];
function engineColor(engine, engines) {
	return ENGINE_PALETTE[Math.max(0, engines.indexOf(engine)) % ENGINE_PALETTE.length];
}
function affinityTableTsv(model) {
	return [["Ligand", ...model.engines.map((engine) => `${engine} (kcal/mol)`)].join("	"), ...model.rows.map((row) => [row.ligand, ...model.engines.map((engine) => {
		const value = row[engine];
		return typeof value === "number" ? value.toFixed(2) : "";
	})].join("	"))].join("\n");
}
var cache = /* @__PURE__ */ new Map();
function fetchPdb(path) {
	let pending = cache.get(path);
	if (!pending) {
		pending = fetch(path).then((res) => {
			if (!res.ok) throw new Error(`Could not load structure ${path}`);
			return res.text();
		});
		cache.set(path, pending);
	}
	return pending;
}
function parseAtom(line) {
	if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return null;
	const alt = line.length > 16 ? line[16] : " ";
	if (alt && alt !== " " && alt !== "A") return null;
	const name = line.slice(12, 16).trim();
	const resName = line.slice(17, 21).trim();
	const chain = line.slice(21, 22).trim() || "A";
	const resSeq = Number.parseInt(line.slice(22, 26), 10);
	const x = Number.parseFloat(line.slice(30, 38));
	const y = Number.parseFloat(line.slice(38, 46));
	const z = Number.parseFloat(line.slice(46, 54));
	if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
	const occupancy = Number.parseFloat(line.slice(54, 60));
	const bFactor = Number.parseFloat(line.slice(60, 66));
	const serial = Number.parseInt(line.slice(6, 11), 10);
	return {
		record: line.startsWith("HETATM") ? "HETATM" : "ATOM",
		serial: Number.isFinite(serial) ? serial : 0,
		name,
		resName,
		chain,
		resSeq: Number.isFinite(resSeq) ? resSeq : 0,
		x,
		y,
		z,
		occupancy: Number.isFinite(occupancy) ? occupancy : 1,
		bFactor: Number.isFinite(bFactor) ? bFactor : 0,
		element: elementFromLine(line, name)
	};
}
function elementFromAtomName(atomName) {
	const letters = atomName.trim().replace(/[^A-Za-z]/g, "");
	const up = letters.toUpperCase();
	if (up.startsWith("CL")) return "Cl";
	if (up.startsWith("BR")) return "Br";
	if (up === "NA" || up === "SOD") return "Na";
	const first = letters[0];
	return first ? first.toUpperCase() : "C";
}
function elementFromLine(line, atomName) {
	const fromName = elementFromAtomName(atomName);
	const col = line.length > 76 ? line.slice(76, 78).trim() : "";
	if (!col) return fromName;
	if (/^[A-Z][a-z]$/.test(col) && col !== "Cl" && col !== "Br") return fromName;
	if (col === "Cl" || col === "CL") return "Cl";
	if (col === "Br" || col === "BR") return "Br";
	if (/^[A-Z]$/.test(col)) return col;
	if (/^[A-Z]{2}$/.test(col)) {
		const up = col.toUpperCase();
		if ((up === "NA" || up === "CA") && fromName !== "Na" && fromName !== "Ca" && fromName !== up) return fromName;
		return col[0] + col[1].toLowerCase();
	}
	return fromName;
}
function parseAtoms(pdb) {
	const atoms = [];
	for (const line of pdb.split("\n")) {
		const atom = parseAtom(line);
		if (atom) atoms.push(atom);
	}
	return atoms;
}
function parseGnina(pdb, filename = "") {
	const remarks = [];
	let title = "";
	let poseRank = null;
	let netCharge = null;
	for (const raw of pdb.split("\n")) {
		const line = raw.trimEnd();
		if (line.startsWith("TITLE")) title = `${title} ${line.slice(6).trim()}`.trim();
		else if (line.startsWith("REMARK") || line.startsWith("HEADER") || line.startsWith("COMPND")) {
			const text = line.replace(/^(REMARK|HEADER|COMPND)\s*/, "").trim();
			if (text) remarks.push(text);
			const pose = text.match(/pose\s*#\s*(\d+)/i);
			if (pose) poseRank = Number.parseInt(pose[1], 10);
			const chg = text.match(/net_charge\s+([+-]?\d+)/i);
			if (chg) netCharge = Number.parseInt(chg[1], 10);
		}
	}
	const blob = `${filename}\n${remarks.join("\n")}\n${title}`;
	const engine = detectEngine(filename, blob);
	return {
		title,
		affinity: parseAffinityText(blob, engine),
		poseRank,
		netCharge,
		engine,
		remarks: remarks.slice(0, 8)
	};
}
function isWaterRes(resName) {
	return WATER_NAMES.has(resName.toUpperCase());
}
function isIonRes(resName) {
	return ION_NAMES.has(resName.toUpperCase());
}
function isLigandHet(atom) {
	if (atom.record !== "HETATM") return false;
	if (isWaterRes(atom.resName) || isIonRes(atom.resName)) return false;
	return true;
}
function splitComplex(pdb) {
	const protein = [];
	const ligand = [];
	const solvent = [];
	for (const line of pdb.split("\n")) if (line.startsWith("ATOM")) protein.push(line);
	else if (line.startsWith("HETATM")) {
		const atom = parseAtom(line);
		if (!atom) continue;
		if (isWaterRes(atom.resName) || isIonRes(atom.resName)) solvent.push(line);
		else ligand.push(line);
	}
	return {
		protein: `${protein.join("\n")}\nEND\n`,
		ligand: `${ligand.join("\n")}\nEND\n`,
		solvent: `${solvent.join("\n")}\nEND\n`
	};
}
function stripHydrogens(pdb) {
	return pdb.split("\n").filter((line) => {
		if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return true;
		const atom = parseAtom(line);
		return Boolean(atom && atom.element !== "H");
	}).join("\n");
}
function dist$1(a, b) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dz = a.z - b.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function collectChargeCenters(atoms) {
	const protein = atoms.filter((a) => a.record === "ATOM" && a.element !== "H");
	const byChain = /* @__PURE__ */ new Map();
	for (const a of protein) {
		const list = byChain.get(a.chain);
		if (list) list.push(a);
		else byChain.set(a.chain, [a]);
	}
	const centers = [];
	for (const [, chainAtoms] of byChain) {
		const seqs = [...new Set(chainAtoms.map((a) => a.resSeq))].sort((a, b) => a - b);
		const nTerm = seqs[0];
		const cTerm = seqs[seqs.length - 1];
		for (const a of chainAtoms) {
			const q = chargeForAtom(a.resName, a.name, a.resSeq === nTerm, a.resSeq === cTerm);
			if (Math.abs(q) < .05) continue;
			centers.push({
				x: a.x,
				y: a.y,
				z: a.z,
				q,
				resName: a.resName,
				chain: a.chain,
				resSeq: a.resSeq
			});
		}
	}
	return centers;
}
function coulombicColor(point, centers) {
	let v = 0;
	for (const c of centers) {
		const r = dist$1(point, c);
		if (r < .9) continue;
		v += c.q / r;
	}
	return rwbColor(v, -.35, .35);
}
function residueHydroColor(resName) {
	return hydroColor(hydropathy(resName));
}
function pocketResidueKeys(protein, ligand, cutoff = 7.5) {
	const keys = /* @__PURE__ */ new Set();
	const lig = ligand.filter((a) => a.element !== "H");
	const prot = protein.filter((a) => a.element !== "H" && a.record === "ATOM");
	for (const p of prot) for (const l of lig) if (dist$1(p, l) <= cutoff) {
		keys.add(`${p.chain}:${p.resSeq}`);
		break;
	}
	return keys;
}
var SS_COLOR$1 = {
	H: "#c97878",
	G: "#c97878",
	I: "#c97878",
	E: "#7a9ed4",
	T: "#6aaa8c",
	C: "#8a8c90"
};
var LINE_COLOR = {
	hbond: "#2dd4bf",
	salt: "#d97878",
	"pi-stack": "#e8a090",
	"pi-cation": "#e8a090"
};
function MolCanvas({ proteinPdb, ligands, figureMode, spin, focus, interactions, ssByKey, pocketKeys, labelsOn, charges, residueLabels, className }) {
	const hostRef = (0, import_react.useRef)(null);
	const libRef = (0, import_react.useRef)(null);
	const viewerRef = (0, import_react.useRef)(null);
	const spinRef = (0, import_react.useRef)(spin);
	const generationRef = (0, import_react.useRef)(0);
	const viewRef = (0, import_react.useRef)(null);
	const structKeyRef = (0, import_react.useRef)("");
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [message, setMessage] = (0, import_react.useState)("Loading viewer");
	const ligandKey = ligands.map((layer) => `${layer.id}:${layer.pdb.length}`).join("|");
	const hitKey = interactions.map((h) => `${h.type}:${h.chain}:${h.resSeq}`).join("|");
	const pocketKey = pocketKeys.join(",");
	spinRef.current = spin;
	(0, import_react.useEffect)(() => {
		const el = hostRef.current;
		if (!el) return;
		let cancelled = false;
		let observer = null;
		load3Dmol().then((lib) => {
			if (cancelled || !hostRef.current) return;
			libRef.current = lib;
			el.innerHTML = "";
			const viewer = lib.createViewer(el, {
				backgroundColor: PAPER_BG,
				antialias: true,
				cartoonQuality: 10,
				preserveDrawingBuffer: true
			});
			viewerRef.current = viewer;
			setLastViewer(viewer);
			viewer.setViewChangeCallback?.((view) => {
				viewRef.current = view;
			});
			el.querySelectorAll("canvas").forEach((canvas) => {
				const node = canvas;
				node.style.zIndex = "0";
				node.style.position = "absolute";
			});
			setStatus("ready");
			observer = new ResizeObserver(() => {
				try {
					viewer.resize();
					viewer.render();
				} catch {}
			});
			observer.observe(el);
		}).catch((err) => {
			if (cancelled) return;
			setStatus("error");
			setMessage(err.message);
		});
		return () => {
			cancelled = true;
			observer?.disconnect();
			try {
				viewerRef.current?.spin(false);
				viewerRef.current?.clear();
			} catch {}
			if (viewerRef.current) setLastViewer(null);
			viewerRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const viewer = viewerRef.current;
		const lib = libRef.current;
		if (!viewer || !lib || status !== "ready") return;
		if (!proteinPdb) return;
		const generation = ++generationRef.current;
		viewer.spin(false);
		viewer.removeAllModels();
		try {
			viewer.removeAllSurfaces();
		} catch {}
		try {
			viewer.removeAllLabels?.();
		} catch {}
		try {
			viewer.removeAllShapes?.();
		} catch {}
		const protein = stripHydrogens(splitComplex(proteinPdb).protein);
		viewer.addModel(protein, "pdb");
		const ssLookup = ssByKey;
		const ssColorFn = (atom) => {
			const key = `${atom.chain ?? "A"}:${atom.resi ?? 0}`;
			const code = ssLookup[key];
			if (code) return SS_COLOR$1[code] ?? SS_COLOR$1.C;
			if (atom.ss) return SS_COLOR$1[{
				h: "H",
				s: "E",
				c: "C"
			}[atom.ss] ?? "C"] ?? SS_COLOR$1.C;
			return "#8a8c90";
		};
		if (figureMode === "interaction") viewer.setStyle({ model: 0 }, { cartoon: {
			opacity: .92,
			color: ssColorFn,
			colorfunc: ssColorFn
		} });
		else if (figureMode === "pocket") viewer.setStyle({ model: 0 }, { cartoon: {
			opacity: .22,
			color: "#6e6c66"
		} });
		else viewer.setStyle({ model: 0 }, { cartoon: {
			opacity: .1,
			color: "#3a3a40"
		} });
		ligands.forEach((layer, index) => {
			const ligand = stripHydrogens(splitComplex(layer.pdb).ligand);
			if (!ligand.trim() || ligand.trim() === "END") return;
			viewer.addModel(ligand, "pdb");
			const model = index + 1;
			const single = ligands.length === 1;
			viewer.setStyle({ model }, single ? { stick: {
				colorscheme: "Jmol",
				radius: .18
			} } : { stick: {
				color: layer.color,
				radius: .17
			} });
			if (single) viewer.addStyle({ model }, { sphere: {
				colorscheme: "Jmol",
				scale: .2
			} });
		});
		const interactingSel = selectionFromKeys(interactions.map((h) => `${h.chain}:${h.resSeq}`));
		if (interactingSel && figureMode === "interaction") viewer.addStyle({ and: [{ model: 0 }, interactingSel] }, { stick: {
			colorscheme: "Jmol",
			radius: .13
		} });
		const polarHits = interactions.filter((h) => h.type === "hbond" || h.type === "salt" || h.type === "pi-stack" || h.type === "pi-cation");
		if (figureMode === "interaction") for (const hit of polarHits) try {
			viewer.addLine?.({
				dashed: true,
				start: hit.start,
				end: hit.end,
				color: LINE_COLOR[hit.type] ?? "#2dd4bf",
				linewidth: 2.2,
				dashLength: .22,
				gapLength: .14
			});
		} catch {}
		if (labelsOn && figureMode === "interaction") {
			const labeled = /* @__PURE__ */ new Set();
			for (const hit of polarHits) {
				const key = `${hit.chain}:${hit.resSeq}`;
				if (labeled.has(key)) continue;
				labeled.add(key);
				const text = residueLabels[key] ?? `${hit.resName}${hit.resSeq}`;
				try {
					viewer.addLabel?.(text, {
						position: hit.start,
						backgroundColor: PAPER_BG,
						backgroundOpacity: .88,
						fontColor: "#1b1a18",
						fontSize: 11,
						borderThickness: 0,
						inFront: true,
						showBackground: true
					});
				} catch {}
			}
		}
		if (figureMode !== "interaction") {
			setMessage("Building surface");
			const pocketSel = selectionFromKeys(pocketKeys.length ? pocketKeys : interactions.map((h) => `${h.chain}:${h.resSeq}`));
			const atomsel = pocketSel ? { and: [{ model: 0 }, pocketSel] } : { model: 0 };
			try {
				const atoms = (viewer.getModel?.(0))?.selectedAtoms?.({}) ?? [];
				for (const raw of atoms) {
					const atom = raw;
					atom.color = figureMode === "electrostatic" ? coulombicColor(atom, charges) : figureMode === "hydrophobic" ? residueHydroColor(atom.resn ?? "GLY") : "#9aa3b0";
				}
			} catch {}
			const colorFn = (atom) => {
				if (figureMode === "electrostatic") return coulombicColor(atom, charges);
				if (figureMode === "hydrophobic") return residueHydroColor(atom.resn ?? "GLY");
				return "#9aa3b0";
			};
			const style = figureMode === "pocket" ? {
				opacity: .72,
				color: "#9aa3b0"
			} : {
				opacity: .9,
				colorfunc: colorFn,
				color: colorFn
			};
			viewer.addSurface(lib.SurfaceType.SAS ?? lib.SurfaceType.VDW, style, atomsel, void 0, () => {
				if (generation !== generationRef.current) return;
				if (viewRef.current && viewer.setView) try {
					viewer.setView(viewRef.current);
				} catch {}
				viewer.render();
			});
		}
		const structKey = `${proteinPdb.length}:${ligandKey}`;
		const structChanged = structKeyRef.current !== structKey;
		structKeyRef.current = structKey;
		const savedView = viewRef.current;
		if (!structChanged && savedView && viewer.setView) try {
			viewer.setView(savedView);
		} catch {
			applyDefaultZoom(viewer, focus, ligands);
		}
		else applyDefaultZoom(viewer, focus, ligands);
		viewer.render();
		try {
			viewRef.current = viewer.getView?.() ?? savedView;
		} catch {}
		if (spinRef.current) viewer.spin("y");
	}, [
		proteinPdb,
		ligandKey,
		figureMode,
		focus,
		status,
		hitKey,
		pocketKey,
		labelsOn,
		Object.keys(ssByKey).length
	]);
	(0, import_react.useEffect)(() => {
		const viewer = viewerRef.current;
		if (!viewer || status !== "ready") return;
		viewer.spin(spin ? "y" : false);
		viewer.render();
	}, [spin, status]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative z-0 isolate min-h-0 overflow-hidden bg-paper", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: hostRef,
				className: "absolute inset-0",
				"data-mol-host": "1"
			}),
			status !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				width: 800,
				height: 600,
				className: "pointer-events-none absolute inset-0 size-full",
				"aria-hidden": true
			}) : null,
			status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-wide text-faint",
					children: message
				})
			}) : status !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-wide text-faint",
					children: "Assembling pocket"
				})
			}) : null
		]
	});
}
function applyDefaultZoom(viewer, focus, ligands) {
	if (focus === "ligand" && ligands.length) {
		viewer.zoomTo({ or: ligands.map((_, i) => ({ model: i + 1 })) });
		try {
			viewer.zoom(1.65, 0);
		} catch {}
	} else viewer.zoomTo();
}
function selectionFromKeys(keys) {
	const byChain = /* @__PURE__ */ new Map();
	for (const key of keys) {
		const [chain, seq] = key.split(":");
		if (!chain || !seq) continue;
		const n = Number.parseInt(seq, 10);
		if (!Number.isFinite(n)) continue;
		const list = byChain.get(chain);
		if (list) list.push(n);
		else byChain.set(chain, [n]);
	}
	if (!byChain.size) return null;
	const parts = [...byChain.entries()].map(([chain, resi]) => ({
		chain,
		resi
	}));
	return parts.length === 1 ? parts[0] : { or: parts };
}
var OX11 = {
	ligandName: "OX-11",
	ligandCode: "OX11",
	formula: "C₂₀H₂₁N₇O₄S"
};
var T2Z14 = {
	ligandName: "T2Z14",
	ligandCode: "T2Z14",
	formula: "C₂₈H₂₆BrN₁₁O₃"
};
function pose(id, label, ligandName, ligandCode, file, formula, affinity, poseRank, netCharge) {
	return {
		id,
		label,
		ligandName,
		ligandCode,
		file: `/structures/${file}`,
		affinity,
		poseRank,
		netCharge,
		formula
	};
}
var TARGETS = [
	{
		id: "4zbe",
		pdbId: "4ZBE",
		gene: "blaKPC-2",
		protein: "KPC-2 carbapenemase",
		family: "Class A β-lactamase",
		oligomer: "monomer",
		description: "Avibactam-bound KPC-2 from Klebsiella pneumoniae. OX-11 is the strongest GNINA pose here, ahead of both T2Z14 and re-docked avibactam.",
		poses: {
			native: pose("native", "Avibactam", "Avibactam", "NXL", "4ZBE_NXL_complex.pdb", "C₇H₁₁N₃O₆S", -5.48, 2, 0),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "4ZBE_OX-11_complex.pdb", OX11.formula, -6.54, 4, 0),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "4ZBE_T2Z14_complex.pdb", T2Z14.formula, -5.63, 10, 0)
		}
	},
	{
		id: "2ov5",
		pdbId: "2OV5",
		gene: "blaKPC-2",
		protein: "KPC-2 carbapenemase",
		family: "Class A β-lactamase",
		oligomer: "trimer",
		description: "Apo crystal of KPC-2 used as an alternate receptor. OX-11 again leads avibactam (NXL) and T2Z14, with a narrower margin than on 4ZBE.",
		poses: {
			native: pose("native", "Avibactam", "Avibactam", "NXL", "2OV5_NXL_complex.pdb", "C₇H₁₁N₃O₆S", -5.97, 14, 0),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "2OV5_OX11_complex.pdb", OX11.formula, -6.42, 17, 0),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "2OV5_T2Z14_complex.pdb", T2Z14.formula, -6.04, 1, 0)
		}
	},
	{
		id: "6ll5",
		pdbId: "6LL5",
		gene: "ftsZ",
		protein: "Cell-division protein FtsZ",
		family: "Tubulin-like GTPase",
		oligomer: "monomer",
		description: "Klebsiella FtsZ (residues 11–316) with the nucleotide site occupied. Native GDP outscores both candidates; T2Z14 is closer than OX-11.",
		poses: {
			native: pose("native", "GDP", "GDP", "GDP", "6LL5_GDP_complex.pdb", "C₁₀H₁₅N₅O₁₁P₂", -7.57, 8, -3),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "6LL5_OX11_complex.pdb", OX11.formula, -6.43, 16, 0),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "6LL5_T2Z14_complex.pdb", T2Z14.formula, -6.66, 12, 0)
		}
	},
	{
		id: "7myl",
		pdbId: "7MYL",
		gene: "dfrA1",
		protein: "Dihydrofolate reductase DfrA1",
		family: "Trimethoprim-resistant DHFR",
		oligomer: "monomer",
		description: "Plasmid-encoded DfrA1 in complex with trimethoprim. Candidate poses are provided without GNINA affinities.",
		poses: {
			native: pose("native", "Trimethoprim", "Trimethoprim", "TOP", "7MYL_native_TOP_trimethoprim_best_pose.pdb", "C₁₄H₁₈N₄O₃", null, null, null),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "7MYL_OX-11_best_pose.pdb", OX11.formula, null, null, null),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "7MYL_T2Z14_best_pose.pdb", T2Z14.formula, null, null, null)
		}
	},
	{
		id: "8qk2",
		pdbId: "8QK2",
		gene: "lpxH",
		protein: "UDP-2,3-diacylglucosamine hydrolase",
		family: "Lipid A biosynthesis",
		oligomer: "monomer",
		description: "LpxH bound to EBL-3339 (VTF), a lipid A pathway inhibitor. Candidate poses are provided without GNINA affinities.",
		poses: {
			native: pose("native", "EBL-3339", "EBL-3339", "VTF", "8QK2_native_VTF_best_pose.pdb", "VTF", null, null, null),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "8QK2_OX-11_best_pose.pdb", OX11.formula, null, null, null),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "8QK2_T2Z14_best_pose.pdb", T2Z14.formula, null, null, null)
		}
	},
	{
		id: "9l5x",
		pdbId: "9L5X",
		gene: "fabI",
		protein: "Enoyl-ACP reductase FabI",
		family: "Fatty-acid biosynthesis",
		oligomer: "monomer",
		description: "FabI in complex with triclosan. Candidate poses are provided without GNINA affinities.",
		poses: {
			native: pose("native", "Triclosan", "Triclosan", "TCL", "9L5X_native_TCL_triclosan_best_pose.pdb", "C₁₂H₇Cl₃O₂", null, null, null),
			ox11: pose("ox11", "OX-11", OX11.ligandName, OX11.ligandCode, "9L5X_OX-11_best_pose.pdb", OX11.formula, null, null, null),
			t2z14: pose("t2z14", "T2Z14", T2Z14.ligandName, T2Z14.ligandCode, "9L5X_T2Z14_best_pose.pdb", T2Z14.formula, null, null, null)
		}
	}
];
var POSE_IDS = [
	"native",
	"ox11",
	"t2z14"
];
var POSE_COLOR = {
	native: "#d6d3d1",
	ox11: "#2dd4bf",
	t2z14: "#e8a090"
};
function formatAffinity(value) {
	if (value === null) return "—";
	return `${value.toFixed(2)}`;
}
function winnerOf(target) {
	let best = null;
	let bestVal = Infinity;
	for (const id of POSE_IDS) {
		const a = target.poses[id].affinity;
		if (a !== null && a < bestVal) {
			bestVal = a;
			best = id;
		}
	}
	return best;
}
var KEY = "poseatlas-chrome";
var CHROME_DEFAULTS = {
	libraryW: 288,
	diagramW: 416,
	inspectorW: 320
};
var LIBRARY_MIN = 220;
var LIBRARY_MAX = 440;
var DIAGRAM_MIN = 280;
var DIAGRAM_MAX = 640;
var INSPECTOR_MIN = 260;
var INSPECTOR_MAX = 480;
function clamp(n, min, max) {
	if (!Number.isFinite(n)) return min;
	return Math.min(max, Math.max(min, Math.round(n)));
}
function clampLibraryW(n) {
	return clamp(n, LIBRARY_MIN, LIBRARY_MAX);
}
function clampDiagramW(n) {
	return clamp(n, DIAGRAM_MIN, DIAGRAM_MAX);
}
function clampInspectorW(n) {
	return clamp(n, INSPECTOR_MIN, INSPECTOR_MAX);
}
function load() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...CHROME_DEFAULTS };
		const parsed = JSON.parse(raw);
		return {
			libraryW: clampLibraryW(parsed.libraryW ?? CHROME_DEFAULTS.libraryW),
			diagramW: clampDiagramW(parsed.diagramW ?? CHROME_DEFAULTS.diagramW),
			inspectorW: clampInspectorW(parsed.inspectorW ?? CHROME_DEFAULTS.inspectorW)
		};
	} catch {
		return { ...CHROME_DEFAULTS };
	}
}
function persist(state) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			libraryW: state.libraryW,
			diagramW: state.diagramW,
			inspectorW: state.inspectorW
		}));
	} catch {}
}
var useChrome = create((set, get) => ({
	...CHROME_DEFAULTS,
	hydrated: false,
	hydrate: () => {
		if (get().hydrated) return;
		set({
			...load(),
			hydrated: true
		});
	},
	setLibraryW: (n) => {
		set({ libraryW: clampLibraryW(n) });
		persist(get());
	},
	setDiagramW: (n) => {
		set({ diagramW: clampDiagramW(n) });
		persist(get());
	},
	setInspectorW: (n) => {
		set({ inspectorW: clampInspectorW(n) });
		persist(get());
	},
	resetLibrary: () => {
		set({ libraryW: CHROME_DEFAULTS.libraryW });
		persist(get());
	},
	resetDiagram: () => {
		set({ diagramW: CHROME_DEFAULTS.diagramW });
		persist(get());
	},
	resetInspector: () => {
		set({ inspectorW: CHROME_DEFAULTS.inspectorW });
		persist(get());
	}
}));
function emptyNames() {
	return {
		protein: "",
		chains: {},
		ligands: {},
		hetatms: {}
	};
}
function chainDisplay(names, chainId) {
	const custom = names.chains[chainId]?.trim();
	if (custom) return custom;
	return `Chain ${chainId}`;
}
function ligandDisplay(names, poseId, fallback) {
	return names.ligands[poseId]?.trim() || fallback;
}
function hetDisplay(names, key, fallback) {
	return names.hetatms[key]?.trim() || fallback;
}
function proteinDisplay(names, fallback) {
	return names.protein.trim() || fallback;
}
var STORAGE_KEY = "poseatlas-nomenclature";
function persistNames(sessionKey, names) {
	if (typeof window === "undefined") return;
	try {
		const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
		all[sessionKey] = names;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
	} catch {}
}
function restoreNames(sessionKey) {
	if (typeof window === "undefined") return null;
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")[sessionKey] ?? null;
	} catch {
		return null;
	}
}
function kindOf(atom) {
	if (atom.record === "ATOM" || STANDARD_AA.has(atom.resName)) return "protein";
	if (isWaterRes(atom.resName)) return "water";
	if (isIonRes(atom.resName)) return "ion";
	if (isLigandHet(atom)) return "ligand";
	return "other";
}
function buildInventory(pdb, filename = "") {
	const atoms = parseAtoms(pdb);
	const meta = parseGnina(pdb, filename);
	const grouped = /* @__PURE__ */ new Map();
	for (const atom of atoms) {
		const key = `${atom.chain}:${atom.resSeq}:${atom.resName}`;
		const list = grouped.get(key);
		if (list) list.push(atom);
		else grouped.set(key, [atom]);
	}
	const residues = [];
	for (const [key, resAtoms] of grouped) {
		const head = resAtoms[0];
		const k = kindOf(head);
		residues.push({
			key,
			chain: head.chain,
			resSeq: head.resSeq,
			resName: head.resName,
			kind: k,
			aaClass: aaClass(head.resName),
			atoms: resAtoms,
			ca: resAtoms.find((a) => a.name === "CA") ?? null
		});
	}
	residues.sort((a, b) => a.chain.localeCompare(b.chain) || a.resSeq - b.resSeq);
	const chains = [...new Set(residues.map((r) => r.chain))].map((id) => {
		const cr = residues.filter((r) => r.chain === id);
		const proteinResidues = cr.filter((r) => r.kind === "protein");
		return {
			id,
			residues: cr,
			proteinResidues,
			atomCount: cr.reduce((n, r) => n + r.atoms.length, 0),
			sequence: proteinResidues.map((r) => {
				return {
					ALA: "A",
					ARG: "R",
					ASN: "N",
					ASP: "D",
					CYS: "C",
					GLN: "Q",
					GLU: "E",
					GLY: "G",
					HIS: "H",
					ILE: "I",
					LEU: "L",
					LYS: "K",
					MET: "M",
					PHE: "F",
					PRO: "P",
					SER: "S",
					THR: "T",
					TRP: "W",
					TYR: "Y",
					VAL: "V",
					MSE: "M"
				}[r.resName] ?? "X";
			}).join("")
		};
	});
	const toHet = (r) => ({
		key: r.key,
		resName: r.resName,
		chain: r.chain,
		resSeq: r.resSeq,
		kind: r.kind,
		atomCount: r.atoms.filter((a) => a.element !== "H").length,
		formula: formulaOf(r.atoms)
	});
	const ligands = residues.filter((r) => r.kind === "ligand").map(toHet);
	ligands.sort((a, b) => b.atomCount - a.atomCount);
	return {
		meta,
		atoms,
		chains,
		residues,
		ligands,
		waters: residues.filter((r) => r.kind === "water").map(toHet),
		ions: residues.filter((r) => r.kind === "ion").map(toHet),
		proteinAtomCount: atoms.filter((a) => a.record === "ATOM").length,
		hetatmCount: atoms.filter((a) => a.record === "HETATM").length,
		residueCount: residues.filter((r) => r.kind === "protein").length
	};
}
function formulaOf(atoms) {
	const counts = /* @__PURE__ */ new Map();
	for (const a of atoms) {
		if (a.element === "H") continue;
		counts.set(a.element, (counts.get(a.element) ?? 0) + 1);
	}
	const order = [
		"C",
		"N",
		"O",
		"P",
		"S",
		"F",
		"Cl",
		"Br",
		"I"
	];
	return [...counts.keys()].sort((a, b) => {
		const ia = order.indexOf(a);
		const ib = order.indexOf(b);
		if (ia === -1 && ib === -1) return a.localeCompare(b);
		if (ia === -1) return 1;
		if (ib === -1) return -1;
		return ia - ib;
	}).map((el) => `${el}${counts.get(el) === 1 ? "" : counts.get(el)}`).join("");
}
function proteinAtoms(inv) {
	return inv.atoms.filter((a) => a.record === "ATOM");
}
function ligandAtoms(inv) {
	return inv.atoms.filter(isLigandHet);
}
var Q1Q2F = 27.888;
var HBOND_CUT = -.5;
function sub$1(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2]
	];
}
function add(a, b) {
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2]
	];
}
function scale$1(a, s) {
	return [
		a[0] * s,
		a[1] * s,
		a[2] * s
	];
}
function dot$1(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross$1(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}
function nrm(a) {
	return Math.sqrt(dot$1(a, a));
}
function norm$1(a) {
	const n = nrm(a) || 1;
	return [
		a[0] / n,
		a[1] / n,
		a[2] / n
	];
}
function vdist(a, b) {
	return nrm(sub$1(a, b));
}
function dihedral(a, b, c, d) {
	const b1 = sub$1(b, a);
	const b2 = sub$1(c, b);
	const b3 = sub$1(d, c);
	const n1 = cross$1(b1, b2);
	const n2 = cross$1(b2, b3);
	const n1n = nrm(n1);
	const n2n = nrm(n2);
	if (n1n < 1e-8 || n2n < 1e-8) return 0;
	const nn1 = [
		n1[0] / n1n,
		n1[1] / n1n,
		n1[2] / n1n
	];
	const nn2 = [
		n2[0] / n2n,
		n2[1] / n2n,
		n2[2] / n2n
	];
	const m = cross$1(nn1, norm$1(b2));
	return Math.atan2(dot$1(m, nn2), dot$1(nn1, nn2)) * (180 / Math.PI);
}
function atomVec(atom) {
	return [
		atom.x,
		atom.y,
		atom.z
	];
}
function buildBackbone(atoms) {
	const groups = /* @__PURE__ */ new Map();
	for (const a of atoms) {
		if (a.record !== "ATOM" || a.element === "H") continue;
		const key = `${a.chain}:${a.resSeq}`;
		const list = groups.get(key);
		if (list) list.push(a);
		else groups.set(key, [a]);
	}
	const bb = [];
	for (const [, resAtoms] of groups) {
		const n = resAtoms.find((a) => a.name === "N");
		const ca = resAtoms.find((a) => a.name === "CA");
		const c = resAtoms.find((a) => a.name === "C");
		const o = resAtoms.find((a) => a.name === "O");
		if (!n || !ca || !c || !o) continue;
		const hAtom = resAtoms.find((a) => a.name === "H" || a.name === "HN");
		bb.push({
			chain: n.chain,
			resSeq: n.resSeq,
			resName: n.resName,
			n: atomVec(n),
			ca: atomVec(ca),
			c: atomVec(c),
			o: atomVec(o),
			h: hAtom ? atomVec(hAtom) : null
		});
	}
	bb.sort((a, b) => a.chain.localeCompare(b.chain) || a.resSeq - b.resSeq);
	for (let i = 0; i < bb.length; i++) {
		const cur = bb[i];
		if (cur.h) continue;
		const prev = i > 0 && bb[i - 1].chain === cur.chain && cur.resSeq - bb[i - 1].resSeq <= 2 ? bb[i - 1] : null;
		if (!prev) continue;
		const v1 = norm$1(sub$1(cur.n, prev.c));
		const v2 = norm$1(sub$1(cur.n, cur.ca));
		cur.h = add(cur.n, scale$1(norm$1(add(v1, v2)), 1.01));
	}
	return bb;
}
function hbondEnergy(donor, acceptor) {
	const h = donor.h;
	if (!h) return 0;
	const rON = vdist(acceptor.o, donor.n);
	const rCH = vdist(acceptor.c, h);
	const rOH = vdist(acceptor.o, h);
	const rCN = vdist(acceptor.c, donor.n);
	if (rON < .5 || rCH < .5 || rOH < .5 || rCN < .5) return 0;
	if (rOH > 5.2) return 0;
	return Q1Q2F * (1 / rON + 1 / rCH - 1 / rOH - 1 / rCN);
}
function isHbonded(donor, acceptor) {
	if (hbondEnergy(donor, acceptor) < HBOND_CUT) return true;
	const rNO = vdist(acceptor.o, donor.n);
	if (rNO > 3.5 || rNO < 2.2) return false;
	const vCO = sub$1(acceptor.o, acceptor.c);
	const vON = sub$1(donor.n, acceptor.o);
	const denom = (nrm(vCO) || 1) * (nrm(vON) || 1);
	const cos = dot$1(vCO, vON) / denom;
	return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI) > 95;
}
function assignSecondaryStructure(atoms) {
	const bb = buildBackbone(atoms);
	const n = bb.length;
	const bonded = Array.from({ length: n }, () => new Uint8Array(n));
	const bestE = new Float64Array(n);
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
		if (i === j) continue;
		if (bb[i].chain !== bb[j].chain) continue;
		const e = hbondEnergy(bb[i], bb[j]);
		if (isHbonded(bb[i], bb[j])) {
			bonded[i][j] = 1;
			if (e < bestE[i]) bestE[i] = e;
		}
	}
	const ss = Array.from({ length: n }, () => "C");
	const markHelix = (offset, code) => {
		const turns = new Uint8Array(n);
		for (let i = 0; i < n - offset; i++) {
			if (bb[i].chain !== bb[i + offset].chain) continue;
			if (bonded[i + offset][i]) turns[i] = 1;
		}
		for (let i = 0; i < n - 1; i++) if (turns[i] && turns[i + 1]) {
			for (let k = 0; k <= offset; k++) if (i + k < n && ss[i + k] === "C") ss[i + k] = code;
		}
	};
	markHelix(4, "H");
	markHelix(3, "G");
	markHelix(5, "I");
	for (let i = 0; i < n; i++) for (let j = i + 3; j < n; j++) {
		if (bb[i].chain !== bb[j].chain) continue;
		const anti = bonded[i][j] && bonded[j][i] || i + 1 < n && j > 0 && bonded[i][j - 1] && bonded[j][i + 1];
		const para = j + 1 < n && bonded[i][j] && bonded[j + 1][i] || i + 1 < n && j + 1 < n && bonded[i + 1][j] && bonded[j + 1][i];
		if (anti || para) {
			if (ss[i] === "C" || ss[i] === "T") ss[i] = "E";
			if (ss[j] === "C" || ss[j] === "T") ss[j] = "E";
		}
	}
	for (let i = 0; i < n - 3; i++) {
		if (ss[i] !== "C") continue;
		if (bb[i].chain !== bb[i + 3].chain) continue;
		if (bonded[i + 3][i]) {
			for (let k = 0; k <= 3; k++) if (ss[i + k] === "C") ss[i + k] = "T";
		}
	}
	const phi = Array.from({ length: n }, () => null);
	const psi = Array.from({ length: n }, () => null);
	for (let i = 0; i < n; i++) {
		const cur = bb[i];
		const prev = i > 0 && bb[i - 1].chain === cur.chain ? bb[i - 1] : null;
		const next = i + 1 < n && bb[i + 1].chain === cur.chain ? bb[i + 1] : null;
		if (prev) phi[i] = dihedral(prev.c, cur.n, cur.ca, cur.c);
		if (next) psi[i] = dihedral(cur.n, cur.ca, cur.c, next.n);
	}
	const helical = (i) => {
		const p = phi[i];
		const s = psi[i];
		return p !== null && s !== null && p < -30 && p > -90 && s < 0 && s > -80;
	};
	const beta = (i) => {
		const p = phi[i];
		const s = psi[i];
		return p !== null && s !== null && p < -70 && s > 70;
	};
	let k = 0;
	while (k < n) {
		const chain = bb[k].chain;
		if (helical(k)) {
			let j = k;
			while (j < n && bb[j].chain === chain && helical(j)) j++;
			if (j - k >= 4) {
				for (let t = k; t < j; t++) if (ss[t] === "C" || ss[t] === "T") ss[t] = "H";
			}
			k = j;
			continue;
		}
		if (beta(k)) {
			let j = k;
			while (j < n && bb[j].chain === chain && beta(j)) j++;
			if (j - k >= 3) {
				for (let t = k; t < j; t++) if (ss[t] === "C" || ss[t] === "T") ss[t] = "E";
			}
			k = j;
			continue;
		}
		k++;
	}
	const residues = bb.map((b, i) => ({
		chain: b.chain,
		resSeq: b.resSeq,
		resName: b.resName,
		ss: ss[i],
		phi: phi[i],
		psi: psi[i],
		energyBest: bestE[i]
	}));
	const composition = {
		helix: 0,
		sheet: 0,
		turn: 0,
		coil: 0
	};
	for (const r of residues) composition[ssGroup(r.ss)] += 1;
	const total = residues.length || 1;
	const percents = {
		helix: composition.helix / total * 100,
		sheet: composition.sheet / total * 100,
		turn: composition.turn / total * 100,
		coil: composition.coil / total * 100
	};
	let helixCount = 0;
	let strandCount = 0;
	let helixResidues = 0;
	let i = 0;
	while (i < n) {
		const g = ssGroup(ss[i]);
		let j = i;
		while (j < n && ssGroup(ss[j]) === g && bb[j].chain === bb[i].chain) j++;
		const len = j - i;
		if (g === "helix" && len >= 3) {
			helixCount += 1;
			helixResidues += len;
		}
		if (g === "sheet" && len >= 2) strandCount += 1;
		i = j;
	}
	const byKey = /* @__PURE__ */ new Map();
	for (const r of residues) byKey.set(`${r.chain}:${r.resSeq}`, r);
	return {
		residues,
		byKey,
		composition,
		percents,
		helixCount,
		strandCount,
		meanHelixLength: helixCount ? helixResidues / helixCount : 0,
		chainIds: [...new Set(residues.map((r) => r.chain))]
	};
}
var FINGERPRINT_COLORS = {
	hbond: "#2dd4bf",
	salt: "#d97878",
	hydrophobic: "#a39e94",
	"pi-stack": "#e8a090",
	"pi-cation": "#e8a090",
	contact: "#4a4a52"
};
function residueTag(chain, resSeq, resName) {
	const pretty = {
		ALA: "Ala",
		ARG: "Arg",
		ASN: "Asn",
		ASP: "Asp",
		CYS: "Cys",
		GLN: "Gln",
		GLU: "Glu",
		GLY: "Gly",
		HIS: "His",
		ILE: "Ile",
		LEU: "Leu",
		LYS: "Lys",
		MET: "Met",
		PHE: "Phe",
		PRO: "Pro",
		SER: "Ser",
		THR: "Thr",
		TRP: "Trp",
		TYR: "Tyr",
		VAL: "Val"
	}[resName] ?? resName;
	return chain === "A" ? `${pretty}${resSeq}` : `${pretty}${resSeq}.${chain}`;
}
function buildFingerprint(rows) {
	const residueSet = /* @__PURE__ */ new Map();
	const cells = /* @__PURE__ */ new Map();
	for (const row of rows) for (const hit of row.hits) {
		const tag = residueTag(hit.chain, hit.resSeq, hit.resName);
		residueSet.set(`${hit.chain}:${hit.resSeq}`, tag);
		const key = `${row.poseId}::${tag}`;
		const list = cells.get(key) ?? [];
		if (!list.includes(hit.type)) list.push(hit.type);
		cells.set(key, list);
	}
	return {
		residues: [...residueSet.entries()].sort((a, b) => {
			const [c1, n1] = a[0].split(":");
			const [c2, n2] = b[0].split(":");
			const chain = (c1 ?? "").localeCompare(c2 ?? "");
			if (chain) return chain;
			return (Number.parseInt(n1 ?? "0", 10) || 0) - (Number.parseInt(n2 ?? "0", 10) || 0);
		}).map(([, tag]) => tag),
		poseIds: rows.map((r) => r.poseId),
		cells
	};
}
function cellKey(poseId, residue) {
	return `${poseId}::${residue}`;
}
function bandResidues(residues, perBand) {
	const size = Math.max(1, perBand);
	const bands = [];
	for (let i = 0; i < residues.length; i += size) bands.push(residues.slice(i, i + size));
	return bands.length ? bands : [[]];
}
function fingerprintFit(nResidues, nPoses, width, height) {
	const nRes = Math.max(nResidues, 1);
	const poses = Math.max(nPoses, 1);
	const innerW = Math.max(80, width - 96);
	const minCell = 12;
	const gap = 3;
	let perBand = nRes;
	let cell = Math.floor(innerW / perBand) - gap;
	if (cell < 14 && nRes > 8) {
		perBand = Math.max(6, Math.floor(innerW / 19));
		cell = Math.floor(innerW / Math.min(perBand, nRes)) - gap;
	}
	cell = Math.max(minCell, Math.min(22, cell));
	if (height && height > 80) {
		const bands = Math.ceil(nRes / perBand);
		const headerH = 56;
		const perBandH = (height - 28 - (bands - 1) * 12) / bands;
		const fromH = Math.floor((perBandH - headerH) / poses) - 4;
		if (fromH > 0) cell = Math.max(8, Math.min(cell, fromH));
	}
	return {
		perBand,
		cell,
		bands: Math.ceil(nRes / perBand)
	};
}
/** Publication plate: every residue stays on the page. One band unless the row would go below 28 px cells. */
function fingerprintPlateLayout(nResidues, nPoses, width = 2200, opts) {
	const nRes = Math.max(1, nResidues);
	const poses = Math.max(1, nPoses);
	const pad = 28;
	const titleH = opts?.titled !== false ? 70 : 0;
	const legendH = 36;
	const labelW = 140;
	const gap = 4;
	const minCell = 28;
	const headerH = 86;
	const innerW = Math.max(160, width - 56 - labelW);
	let perBand = nRes;
	let cell = Math.floor(innerW / perBand) - gap;
	if (cell < minCell && nRes > 12) {
		perBand = Math.max(10, Math.floor(innerW / 32));
		cell = Math.floor(innerW / Math.min(perBand, nRes)) - gap;
	}
	cell = Math.max(18, Math.min(42, cell));
	const bands = Math.ceil(nRes / perBand);
	const rowH = cell + 12;
	const bandH = headerH + poses * rowH + 4;
	const bandGap = 20;
	return {
		width,
		height: pad + titleH + bands * bandH + Math.max(0, bands - 1) * bandGap + legendH + pad,
		perBand,
		cell,
		gap,
		labelW,
		pad,
		titleH,
		headerH,
		rowH,
		bandH,
		bandGap,
		legendH,
		bands
	};
}
var DONOR = /* @__PURE__ */ new Set([
	"N",
	"O",
	"S"
]);
var ACCEPTOR = /* @__PURE__ */ new Set([
	"N",
	"O",
	"S",
	"F"
]);
var POS_ATOMS = /* @__PURE__ */ new Set([
	"NZ",
	"NH1",
	"NH2",
	"NE",
	"ND1",
	"NE2"
]);
var NEG_ATOMS = /* @__PURE__ */ new Set([
	"OD1",
	"OD2",
	"OE1",
	"OE2",
	"OXT"
]);
var HYDROPHOBIC_RES = /* @__PURE__ */ new Set([
	"ALA",
	"VAL",
	"LEU",
	"ILE",
	"MET",
	"PHE",
	"TRP",
	"PRO",
	"TYR"
]);
var RING = {
	PHE: [[
		"CG",
		"CD1",
		"CD2",
		"CE1",
		"CE2",
		"CZ"
	]],
	TYR: [[
		"CG",
		"CD1",
		"CD2",
		"CE1",
		"CE2",
		"CZ"
	]],
	HIS: [[
		"CG",
		"ND1",
		"CD2",
		"CE1",
		"NE2"
	]],
	TRP: [[
		"CG",
		"CD1",
		"NE1",
		"CE2",
		"CD2"
	], [
		"CD2",
		"CE2",
		"CE3",
		"CZ3",
		"CH2",
		"CZ2"
	]]
};
function centroid(atoms) {
	const n = atoms.length || 1;
	return {
		x: atoms.reduce((s, a) => s + a.x, 0) / n,
		y: atoms.reduce((s, a) => s + a.y, 0) / n,
		z: atoms.reduce((s, a) => s + a.z, 0) / n
	};
}
function groupResidues(atoms) {
	const map = /* @__PURE__ */ new Map();
	for (const a of atoms) {
		const key = `${a.chain}:${a.resSeq}:${a.resName}`;
		const list = map.get(key);
		if (list) list.push(a);
		else map.set(key, [a]);
	}
	return map;
}
function ligandRings(ligand) {
	const heavy = ligand.filter((a) => a.element !== "H").slice(0, 64);
	const n = heavy.length;
	const nbr = Array.from({ length: n }, () => []);
	for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
		const d = dist$1(heavy[i], heavy[j]);
		if (d > 1.15 && d < 1.85) {
			nbr[i].push(j);
			nbr[j].push(i);
		}
	}
	const rings = [];
	const seen = /* @__PURE__ */ new Set();
	const walk = (start, current, path, depth) => {
		if (rings.length >= 12 || depth > 6) return;
		for (const nxt of nbr[current]) {
			if (depth >= 4 && depth <= 6 && nxt === start) {
				const key = [...path].sort((a, b) => a - b).join(",");
				if (!seen.has(key)) {
					seen.add(key);
					rings.push(centroid(path.map((i) => heavy[i])));
				}
				continue;
			}
			if (path.includes(nxt)) continue;
			walk(start, nxt, [...path, nxt], depth + 1);
		}
	};
	for (let i = 0; i < n && rings.length < 12; i++) if ((nbr[i]?.length ?? 0) >= 2) walk(i, i, [i], 1);
	return rings;
}
function residueRings(resName, atoms) {
	const defs = RING[resName];
	if (!defs) return [];
	const out = [];
	for (const names of defs) {
		const picked = names.map((nm) => atoms.find((a) => a.name === nm)).filter((a) => Boolean(a));
		if (picked.length >= 5) out.push(centroid(picked));
	}
	return out;
}
function ligandChargeAtoms(ligand) {
	const pos = [];
	const neg = [];
	for (const a of ligand) {
		if (a.element === "H") continue;
		if (a.element === "N" && (a.name.startsWith("N") || a.name.includes("N"))) pos.push(a);
		if (a.element === "O" && /OXT|OD|OE|O[0-9]/.test(a.name)) neg.push(a);
	}
	return {
		pos,
		neg
	};
}
function findInteractions(protein, ligand) {
	const prot = protein.filter((a) => a.element !== "H" && a.record === "ATOM");
	const lig = ligand.filter((a) => a.element !== "H");
	if (!prot.length || !lig.length) return [];
	const resMap = groupResidues(prot);
	const ligRings = ligandRings(lig);
	const ligQ = ligandChargeAtoms(lig);
	const found = [];
	const typed = /* @__PURE__ */ new Set();
	const push = (hit) => {
		const key = `${hit.type}:${hit.chain}:${hit.resSeq}:${hit.residueAtom}:${hit.ligandAtom}`;
		if (typed.has(key)) return;
		typed.add(key);
		found.push(hit);
	};
	for (const [, atoms] of resMap) {
		const head = atoms[0];
		const cls = aaClass(head.resName);
		for (const p of atoms) for (const l of lig) {
			const d = dist$1(p, l);
			if (d > 4.6) continue;
			const polarPair = DONOR.has(p.element) && ACCEPTOR.has(l.element);
			const polarRev = DONOR.has(l.element) && ACCEPTOR.has(p.element);
			if ((polarPair || polarRev) && d <= 3.5) push({
				type: d <= 4 && (POS_ATOMS.has(p.name) && (l.element === "O" || l.element === "N") || NEG_ATOMS.has(p.name) && l.element === "N") ? "salt" : "hbond",
				chain: head.chain,
				resSeq: head.resSeq,
				resName: head.resName,
				residueAtom: p.name,
				ligandAtom: l.name,
				distance: d,
				start: {
					x: p.x,
					y: p.y,
					z: p.z
				},
				end: {
					x: l.x,
					y: l.y,
					z: l.z
				}
			});
			else if (d <= 4.5 && p.element === "C" && l.element === "C" && (HYDROPHOBIC_RES.has(head.resName) || cls === "aromatic" || cls === "hydrophobic")) push({
				type: "hydrophobic",
				chain: head.chain,
				resSeq: head.resSeq,
				resName: head.resName,
				residueAtom: p.name,
				ligandAtom: l.name,
				distance: d,
				start: {
					x: p.x,
					y: p.y,
					z: p.z
				},
				end: {
					x: l.x,
					y: l.y,
					z: l.z
				}
			});
		}
		const rings = residueRings(head.resName, atoms);
		for (const rr of rings) {
			for (const lr of ligRings) {
				const d = dist$1(rr, lr);
				if (d >= 3.2 && d <= 5.2) push({
					type: "pi-stack",
					chain: head.chain,
					resSeq: head.resSeq,
					resName: head.resName,
					residueAtom: "ring",
					ligandAtom: "ring",
					distance: d,
					start: rr,
					end: lr
				});
			}
			for (const n of ligQ.pos) {
				const d = dist$1(rr, n);
				if (d <= 5) push({
					type: "pi-cation",
					chain: head.chain,
					resSeq: head.resSeq,
					resName: head.resName,
					residueAtom: "ring",
					ligandAtom: n.name,
					distance: d,
					start: rr,
					end: {
						x: n.x,
						y: n.y,
						z: n.z
					}
				});
			}
		}
	}
	const best = /* @__PURE__ */ new Map();
	for (const hit of found) {
		const key = `${hit.type}:${hit.chain}:${hit.resSeq}`;
		const prev = best.get(key);
		if (!prev || hit.distance < prev.distance) best.set(key, hit);
	}
	for (const [, atoms] of resMap) {
		const head = atoms[0];
		if ([...best.values()].some((h) => h.chain === head.chain && h.resSeq === head.resSeq)) continue;
		let closest = null;
		for (const p of atoms) for (const l of lig) {
			const d = dist$1(p, l);
			if (d > 4) continue;
			if (!closest || d < closest.distance) closest = {
				type: "contact",
				chain: head.chain,
				resSeq: head.resSeq,
				resName: head.resName,
				residueAtom: p.name,
				ligandAtom: l.name,
				distance: d,
				start: {
					x: p.x,
					y: p.y,
					z: p.z
				},
				end: {
					x: l.x,
					y: l.y,
					z: l.z
				}
			};
		}
		if (closest) best.set(`contact:${head.chain}:${head.resSeq}`, closest);
	}
	return [...best.values()].sort((a, b) => a.distance - b.distance);
}
var INTERACTION_LABEL = {
	hbond: "H-bond",
	salt: "Salt bridge",
	hydrophobic: "Hydrophobic",
	"pi-stack": "π-stacking",
	"pi-cation": "π-cation",
	contact: "Contact"
};
function uniqueResidues(hits) {
	const seen = /* @__PURE__ */ new Map();
	for (const h of hits) {
		const key = `${h.chain}:${h.resSeq}`;
		if (!seen.has(key)) seen.set(key, {
			chain: h.chain,
			resSeq: h.resSeq,
			resName: h.resName
		});
	}
	return [...seen.values()];
}
function tabulateResidues(hits) {
	const byRes = /* @__PURE__ */ new Map();
	for (const hit of hits) {
		const key = `${hit.chain}:${hit.resSeq}`;
		const prev = byRes.get(key);
		if (!prev) {
			byRes.set(key, {
				chain: hit.chain,
				resSeq: hit.resSeq,
				resName: hit.resName,
				types: [hit.type],
				residueAtom: hit.residueAtom,
				ligandAtom: hit.ligandAtom,
				distance: hit.distance
			});
			continue;
		}
		if (!prev.types.includes(hit.type)) prev.types.push(hit.type);
		if (hit.distance < prev.distance) {
			prev.distance = hit.distance;
			prev.residueAtom = hit.residueAtom;
			prev.ligandAtom = hit.ligandAtom;
		}
	}
	const rank = {
		salt: 0,
		hbond: 1,
		"pi-stack": 2,
		"pi-cation": 3,
		hydrophobic: 4,
		contact: 5
	};
	return [...byRes.values()].sort((a, b) => {
		if (a.chain !== b.chain) return a.chain.localeCompare(b.chain);
		if (a.resSeq !== b.resSeq) return a.resSeq - b.resSeq;
		return (rank[a.types[0]] ?? 9) - (rank[b.types[0]] ?? 9);
	});
}
function commonContacts(rows) {
	if (rows.length < 2) return [];
	const perPose = rows.map((row) => tabulateResidues(row.hits));
	const index = /* @__PURE__ */ new Map();
	for (const table of perPose) {
		const seen = /* @__PURE__ */ new Set();
		for (const row of table) {
			const key = `${row.chain}:${row.resSeq}`;
			if (seen.has(key)) continue;
			seen.add(key);
			const prev = index.get(key);
			if (!prev) index.set(key, {
				chain: row.chain,
				resSeq: row.resSeq,
				resName: row.resName,
				types: new Set(row.types),
				dists: [row.distance],
				n: 1
			});
			else {
				prev.n += 1;
				prev.dists.push(row.distance);
				for (const t of row.types) prev.types.add(t);
			}
		}
	}
	return [...index.values()].filter((row) => row.n === rows.length).sort((a, b) => {
		if (a.chain !== b.chain) return a.chain.localeCompare(b.chain);
		return a.resSeq - b.resSeq;
	}).map((row) => ({
		chain: row.chain,
		resSeq: row.resSeq,
		resName: row.resName,
		nPoses: row.n,
		types: [...row.types],
		meanDist: row.dists.reduce((s, d) => s + d, 0) / row.dists.length
	}));
}
function sessionKey(kind, libraryTargetId, poses) {
	if (kind === "library" && libraryTargetId) return `lib:${libraryTargetId}`;
	return `up:${poses.map((p) => p.filename).sort().join("|")}`;
}
function remember(get) {
	const s = get();
	persistNames(sessionKey(s.kind, s.libraryTargetId, s.poses), s.names);
}
function applyRestored(kind, libraryTargetId, poses, base) {
	const saved = restoreNames(sessionKey(kind, libraryTargetId, poses));
	if (!saved) return base;
	return {
		protein: saved.protein || base.protein,
		chains: {
			...base.chains,
			...saved.chains
		},
		ligands: {
			...base.ligands,
			...saved.ligands
		},
		hetatms: {
			...base.hetatms,
			...saved.hetatms
		}
	};
}
function poseFromPdb(id, filename, pdb, color, source, fallbackLabel, affinity, engine) {
	const inventory = buildInventory(pdb, filename);
	return {
		id,
		filename,
		pdb,
		inventory,
		color,
		source,
		fallbackLabel,
		affinity: affinity ?? inventory.meta.affinity,
		engine: engine || inventory.meta.engine || detectEngine(filename, inventory.meta.remarks.join("\n"))
	};
}
async function filesToPoses(files, startIndex) {
	const pdbFiles = files.filter((f) => /\.(pdb|ent|txt)$/i.test(f.name));
	const poses = [];
	for (let i = 0; i < pdbFiles.length; i++) {
		const file = pdbFiles[i];
		const pdb = await file.text();
		const inv = buildInventory(pdb, file.name);
		if (!inv.atoms.length) continue;
		const lig = inv.ligands[0];
		const fallback = canonicalLigandName(file.name, lig?.resName ?? file.name.replace(/\.[^.]+$/, ""));
		poses.push(poseFromPdb(`up-${Date.now()}-${startIndex + i}-${file.name.replace(/[^a-zA-Z0-9]+/g, "-")}`, file.name, pdb, POSE_PALETTE[(startIndex + i) % POSE_PALETTE.length], "upload", fallback, inv.meta.affinity, inv.meta.engine));
	}
	return poses;
}
var useSession = create((set, get) => ({
	kind: "library",
	libraryTargetId: null,
	proteinFallback: "Protein",
	names: emptyNames(),
	poses: [],
	visibleIds: [],
	focusedId: null,
	figureMode: "interaction",
	spin: false,
	frame: "ligand",
	labelsOn: true,
	chartOpen: false,
	chartStyle: "overlay",
	hydrating: true,
	loadError: null,
	dropActive: false,
	setProteinName: (value) => {
		set((s) => ({ names: {
			...s.names,
			protein: value
		} }));
		remember(get);
	},
	setChainName: (chain, value) => {
		set((s) => ({ names: {
			...s.names,
			chains: {
				...s.names.chains,
				[chain]: value
			}
		} }));
		remember(get);
	},
	setLigandName: (poseId, value) => {
		set((s) => ({ names: {
			...s.names,
			ligands: {
				...s.names.ligands,
				[poseId]: value
			}
		} }));
		remember(get);
	},
	setHetName: (key, value) => {
		set((s) => ({ names: {
			...s.names,
			hetatms: {
				...s.names.hetatms,
				[key]: value
			}
		} }));
		remember(get);
	},
	setEngine: (poseId, engine) => {
		set((s) => ({ poses: s.poses.map((p) => p.id === poseId ? {
			...p,
			engine
		} : p) }));
	},
	setAffinity: (poseId, affinity) => {
		set((s) => ({ poses: s.poses.map((p) => p.id === poseId ? {
			...p,
			affinity
		} : p) }));
	},
	toggleVisible: (id) => {
		set((s) => {
			if (s.visibleIds.includes(id)) {
				if (s.visibleIds.length === 1) return s;
				const visibleIds = s.visibleIds.filter((x) => x !== id);
				return {
					visibleIds,
					focusedId: s.focusedId === id ? visibleIds[0] : s.focusedId
				};
			}
			return {
				visibleIds: [...s.visibleIds, id],
				focusedId: id
			};
		});
	},
	solo: (id) => set({
		visibleIds: [id],
		focusedId: id
	}),
	overlayAll: () => set((s) => ({
		visibleIds: s.poses.map((p) => p.id),
		focusedId: s.focusedId ?? s.poses[0]?.id ?? null
	})),
	setFocused: (id) => set({ focusedId: id }),
	setFigureMode: (figureMode) => set({ figureMode }),
	setSpin: (value) => set((s) => ({ spin: typeof value === "function" ? value(s.spin) : value })),
	setFrame: (frame) => set({ frame }),
	setLabelsOn: (labelsOn) => set({ labelsOn }),
	setChartOpen: (chartOpen) => set({ chartOpen }),
	setChartStyle: (chartStyle) => set({ chartStyle }),
	setDropActive: (dropActive) => set({ dropActive }),
	loadLibraryTarget: async (targetId) => {
		const target = TARGETS.find((t) => t.id === targetId);
		if (!target) return;
		set({
			hydrating: true,
			loadError: null,
			libraryTargetId: targetId,
			kind: "library"
		});
		try {
			const poses = await Promise.all([
				"native",
				"ox11",
				"t2z14"
			].map(async (pid, index) => {
				const pose = target.poses[pid];
				const pdb = await fetchPdb(pose.file);
				const filename = pose.file.split("/").pop() ?? pose.file;
				return poseFromPdb(`${target.id}-${pid}`, filename, pdb, POSE_PALETTE[index] ?? POSE_PALETTE[0], "library", pose.label, pose.affinity, "GNINA");
			}));
			const chainNames = {};
			for (const chain of poses[0]?.inventory.chains ?? []) chainNames[chain.id] = "";
			const ligandNames = {};
			for (const p of poses) ligandNames[p.id] = p.fallbackLabel;
			const hetatms = {};
			for (const lig of poses[0]?.inventory.ligands ?? []) hetatms[lig.key] = lig.resName;
			const names = applyRestored("library", targetId, poses, {
				protein: target.protein,
				chains: chainNames,
				ligands: ligandNames,
				hetatms
			});
			const candidate = poses.find((p) => p.id.endsWith("-ox11")) ?? poses[1] ?? poses[0];
			set({
				kind: "library",
				libraryTargetId: targetId,
				proteinFallback: target.protein,
				names,
				poses,
				visibleIds: [candidate.id],
				focusedId: candidate.id,
				hydrating: false,
				loadError: null,
				chartOpen: false
			});
		} catch (err) {
			set({
				hydrating: false,
				loadError: err instanceof Error ? err.message : "Failed to load structures"
			});
		}
	},
	loadFiles: async (files) => {
		set({
			hydrating: true,
			loadError: null,
			kind: "workspace",
			libraryTargetId: null
		});
		try {
			const poses = await filesToPoses(files, 0);
			if (!poses.length) {
				set({
					hydrating: false,
					loadError: "Drop PDB files from any docking engine"
				});
				return;
			}
			const first = poses[0];
			const chainNames = {};
			for (const chain of first.inventory.chains) chainNames[chain.id] = "";
			const ligandNames = {};
			for (const p of poses) ligandNames[p.id] = p.fallbackLabel;
			const hetatms = {};
			for (const p of poses) for (const lig of p.inventory.ligands) hetatms[lig.key] = lig.resName;
			const proteinFallback = first.inventory.meta.title || first.filename.replace(/\.[^.]+$/, "");
			set({
				kind: "workspace",
				libraryTargetId: null,
				proteinFallback,
				names: applyRestored("workspace", null, poses, {
					protein: proteinFallback,
					chains: chainNames,
					ligands: ligandNames,
					hetatms
				}),
				poses,
				visibleIds: poses.map((p) => p.id),
				focusedId: poses[0].id,
				hydrating: false,
				loadError: null,
				chartOpen: false
			});
			remember(get);
		} catch (err) {
			set({
				hydrating: false,
				loadError: err instanceof Error ? err.message : "Could not read those files"
			});
		}
	},
	addFiles: async (files) => {
		const current = get();
		if (!current.poses.length) {
			await get().loadFiles(files);
			return;
		}
		set({
			hydrating: true,
			loadError: null
		});
		try {
			const extra = await filesToPoses(files, current.poses.length);
			if (!extra.length) {
				set({
					hydrating: false,
					loadError: "No atoms found in those files"
				});
				return;
			}
			const ligandNames = { ...current.names.ligands };
			const hetatms = { ...current.names.hetatms };
			const existing = current.poses.map((x) => ({
				filename: x.filename,
				fallbackLabel: x.fallbackLabel,
				display: ligandDisplay(current.names, x.id, x.fallbackLabel)
			}));
			for (const p of extra) {
				ligandNames[p.id] = matchLigandToExisting(p.filename, p.fallbackLabel, existing);
				for (const lig of p.inventory.ligands) hetatms[lig.key] = lig.resName;
			}
			const poses = [...current.poses, ...extra];
			const visibleIds = [.../* @__PURE__ */ new Set([...current.visibleIds, ...extra.map((p) => p.id)])];
			set({
				poses,
				names: {
					...current.names,
					ligands: ligandNames,
					hetatms
				},
				visibleIds,
				focusedId: extra[0].id,
				hydrating: false,
				loadError: null,
				chartOpen: false
			});
			remember(get);
		} catch (err) {
			set({
				hydrating: false,
				loadError: err instanceof Error ? err.message : "Could not add those poses"
			});
		}
	},
	removePose: (id) => set((s) => {
		const poses = s.poses.filter((p) => p.id !== id);
		const visibleIds = s.visibleIds.filter((x) => x !== id);
		const focusedId = s.focusedId === id ? visibleIds[0] ?? poses[0]?.id ?? null : s.focusedId;
		return {
			poses,
			visibleIds: visibleIds.length ? visibleIds : poses.slice(0, 1).map((p) => p.id),
			focusedId
		};
	})
}));
function selectFocused(state) {
	return state.poses.find((p) => p.id === state.focusedId) ?? state.poses[0] ?? null;
}
function selectVisible(state) {
	return state.poses.filter((p) => state.visibleIds.includes(p.id));
}
function useAnalysis() {
	const session = useSession();
	const focused = selectFocused(session);
	const visible = selectVisible(session);
	const receptor = (0, import_react.useMemo)(() => {
		if (!session.poses.length) return null;
		return session.poses.find((p) => p.id.endsWith("-native")) ?? session.poses[0] ?? null;
	}, [session.poses]);
	const ss = (0, import_react.useMemo)(() => {
		if (!receptor) return null;
		return assignSecondaryStructure(proteinAtoms(receptor.inventory));
	}, [receptor]);
	const focusedHits = (0, import_react.useMemo)(() => {
		if (!receptor || !focused) return [];
		return findInteractions(proteinAtoms(receptor.inventory), ligandAtoms(focused.inventory));
	}, [receptor, focused]);
	const hitsByPose = (0, import_react.useMemo)(() => {
		if (!receptor) return [];
		return visible.map((pose) => ({
			poseId: pose.id,
			hits: findInteractions(proteinAtoms(receptor.inventory), ligandAtoms(pose.inventory))
		}));
	}, [receptor, visible]);
	const fingerprint = (0, import_react.useMemo)(() => buildFingerprint(hitsByPose), [hitsByPose]);
	const pocketKeys = (0, import_react.useMemo)(() => {
		if (!receptor || !focused) return /* @__PURE__ */ new Set();
		return pocketResidueKeys(proteinAtoms(receptor.inventory), ligandAtoms(focused.inventory), 7.5);
	}, [receptor, focused]);
	const charges = (0, import_react.useMemo)(() => receptor ? collectChargeCenters(proteinAtoms(receptor.inventory)) : [], [receptor]);
	const names = session.names;
	const proteinName = proteinDisplay(names, session.proteinFallback);
	const focusedLabel = focused ? ligandDisplay(names, focused.id, focused.fallbackLabel) : "";
	return {
		session,
		receptor,
		focused,
		visible,
		ss,
		focusedHits,
		hitsByPose,
		fingerprint,
		pocketKeys,
		charges,
		proteinName,
		focusedLabel,
		caption: (0, import_react.useMemo)(() => buildCaption({
			proteinName,
			ligandName: focusedLabel,
			mode: session.figureMode,
			overlay: visible.length > 1,
			overlayNames: visible.map((p) => ligandDisplay(names, p.id, p.fallbackLabel)),
			nContacts: uniqueResidues(focusedHits).length,
			chainNote: receptor ? receptor.inventory.chains.map((c) => chainDisplay(names, c.id)).join(" · ") : ""
		}), [
			proteinName,
			focusedLabel,
			session.figureMode,
			visible,
			names,
			focusedHits,
			receptor
		])
	};
}
function buildCaption(args) {
	const modeLine = {
		interaction: "Cartoon with interacting side chains and polar contacts.",
		pocket: "Cutaway solvent-accessible surface of the binding pocket.",
		electrostatic: "Pocket surface coloured by a Coulombic approximation from formal charges at pH 7.",
		hydrophobic: "Pocket surface coloured by Kyte–Doolittle hydropathy."
	};
	if (args.overlay) return `Figure. Overlay of ${args.overlayNames.join(", ")} in ${args.proteinName}. ${modeLine[args.mode]}`;
	const site = args.nContacts ? `${args.nContacts} contacting residues.` : "Binding-site view.";
	return `Figure. ${args.ligandName} bound to ${args.proteinName}${args.chainNote ? ` (${args.chainNote})` : ""}. ${site} ${modeLine[args.mode]}`;
}
var PLATE_CSS_W = 1024;
var SPAN_PRESETS = [
	{
		span: 4,
		label: "⅓"
	},
	{
		span: 6,
		label: "½"
	},
	{
		span: 8,
		label: "⅔"
	},
	{
		span: 12,
		label: "Full"
	}
];
function clampSpan(span) {
	if (!Number.isFinite(span)) return 4;
	return Math.min(12, Math.max(1, Math.round(span)));
}
function clampHeight(height) {
	if (!Number.isFinite(height)) return 120;
	return Math.min(720, Math.max(120, Math.round(height)));
}
function defaultPanelSpan(kind) {
	if (kind === "ss" || kind === "chart" || kind === "fingerprint" || kind === "residues") return 12;
	if (kind === "contacts") return 6;
	if (kind === "sketch") return 6;
	return 4;
}
function defaultPanelHeight(kind) {
	switch (kind) {
		case "ss": return 168;
		case "chart": return 280;
		case "fingerprint": return 220;
		case "sketch": return 300;
		case "contacts": return 220;
		case "residues": return 340;
		default: return 232;
	}
}
/** Old plates used a 3-column span (1 | 2 | 3). */
function looksLegacySpans(panels) {
	return panels.length > 0 && panels.every((p) => p.span === 1 || p.span === 2 || p.span === 3);
}
function migrateLegacySpan(span) {
	if (span === 1 || span === 2 || span === 3) return span * 4;
	return clampSpan(span);
}
function packScene(panels, columns = 12) {
	let col = 0;
	let row = 0;
	const cells = [];
	for (const panel of panels) {
		const span = Math.min(Math.max(clampSpan(panel.span), 1), columns);
		if (col + span > columns) {
			row += 1;
			col = 0;
		}
		cells.push({
			id: panel.id,
			col,
			row,
			span
		});
		col += span;
	}
	return {
		cells,
		rows: panels.length ? row + 1 : 0
	};
}
function uid(prefix) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function scaffold() {
	return [{
		id: uid("ss"),
		kind: "ss",
		title: "Secondary structure",
		caption: "Kabsch–Sander DSSP, colour-coded by helix, sheet, turn and coil.",
		span: 12
	}, {
		id: uid("chart"),
		kind: "chart",
		title: "Binding affinity",
		caption: "kcal/mol · more negative is stronger.",
		span: 12
	}];
}
var useScene = create((set, get) => ({
	open: false,
	title: "",
	subtitle: "",
	panels: [],
	selectedId: null,
	notice: null,
	setOpen: (open) => set({ open }),
	setTitle: (title) => set({ title }),
	setSubtitle: (subtitle) => set({ subtitle }),
	setSelected: (selectedId) => set({ selectedId }),
	setNotice: (notice) => set({ notice }),
	ensureScaffold: () => {
		const { panels } = get();
		if (panels.some((p) => p.kind === "ss") && panels.some((p) => p.kind === "chart")) return;
		const next = [...panels];
		if (!next.some((p) => p.kind === "ss")) next.unshift(scaffold()[0]);
		if (!next.some((p) => p.kind === "chart")) next.push(scaffold()[1]);
		set({ panels: next });
	},
	migrateLayout: () => {
		const { panels } = get();
		if (!looksLegacySpans(panels)) return;
		set({ panels: panels.map((p) => ({
			...p,
			span: migrateLegacySpan(p.span)
		})) });
	},
	addPanel: (panel, opts) => {
		const id = panel.id ?? uid(panel.kind);
		const first = get().panels.length === 0;
		const span = clampSpan(panel.span ?? defaultPanelSpan(panel.kind));
		const height = panel.height != null ? clampHeight(panel.height) : void 0;
		set((s) => ({
			panels: [...s.panels, {
				...panel,
				id,
				span,
				height
			}],
			selectedId: id,
			open: opts?.open ?? (s.open || first)
		}));
		return id;
	},
	addSnapshot: (panel) => {
		const id = uid("snap");
		const item = {
			id,
			kind: "snapshot",
			title: panel.title,
			caption: panel.caption,
			src: panel.src,
			span: clampSpan(panel.span ?? 4),
			height: panel.height != null ? clampHeight(panel.height) : void 0
		};
		set((s) => {
			const panels = [...s.panels];
			const chartIdx = panels.findIndex((p) => p.kind === "chart");
			const at = chartIdx === -1 ? panels.length : chartIdx;
			panels.splice(at, 0, item);
			return {
				panels,
				selectedId: id,
				open: s.open || true,
				notice: "Saved to scene"
			};
		});
		return id;
	},
	updatePanel: (id, patch) => set((s) => ({ panels: s.panels.map((p) => {
		if (p.id !== id) return p;
		const next = {
			...p,
			...patch
		};
		next.span = clampSpan(next.span);
		if (next.height != null) next.height = clampHeight(next.height);
		return next;
	}) })),
	removePanel: (id) => set((s) => ({
		panels: s.panels.filter((p) => p.id !== id),
		selectedId: s.selectedId === id ? null : s.selectedId
	})),
	movePanel: (fromId, toId) => {
		if (fromId === toId) return;
		set((s) => {
			const panels = [...s.panels];
			const from = panels.findIndex((p) => p.id === fromId);
			const to = panels.findIndex((p) => p.id === toId);
			if (from < 0 || to < 0) return s;
			const [item] = panels.splice(from, 1);
			panels.splice(to, 0, item);
			return { panels };
		});
	},
	clear: () => set({
		panels: [],
		selectedId: null
	})
}));
var FIGURE_TITLES = {
	interaction: "Ligand interactions",
	pocket: "Pocket cutaway",
	electrostatic: "Electrostatic pocket",
	hydrophobic: "Hydrophobic pocket"
};
function formatKcal(value) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return "—";
	return n.toFixed(2);
}
function recolorPaper(svg) {
	const dark = "#1b1a18";
	const grid = "#d8d2c6";
	svg.querySelectorAll("text").forEach((node) => {
		const fill = node.getAttribute("fill") || "";
		if (fill.includes("muted") || fill.includes("faint") || fill === "var(--color-muted)") node.setAttribute("fill", "#5c5a54");
		else if (fill.includes("fg") || fill === "var(--color-fg)") node.setAttribute("fill", dark);
	});
	svg.querySelectorAll("line, path").forEach((node) => {
		const stroke = node.getAttribute("stroke") || "";
		if (stroke.includes("border") || stroke.includes("faint")) node.setAttribute("stroke", grid);
	});
}
function AffinityChart({ poses }) {
	const names = useSession((s) => s.names);
	const chartStyle = useSession((s) => s.chartStyle);
	const setChartStyle = useSession((s) => s.setChartStyle);
	const wrapRef = (0, import_react.useRef)(null);
	const labeled = (0, import_react.useMemo)(() => poses.map((p) => ({
		ligand: ligandDisplay(names, p.id, p.fallbackLabel),
		engine: p.engine.trim() || "Unknown",
		affinity: p.affinity,
		color: p.color
	})), [poses, names]);
	const model = (0, import_react.useMemo)(() => buildAffinityChart(labeled), [labeled]);
	const ligandColors = (0, import_react.useMemo)(() => {
		const map = {};
		for (const pose of labeled) if (!map[pose.ligand]) map[pose.ligand] = pose.color;
		return map;
	}, [labeled]);
	if (!model.scored) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tracking-widest text-faint uppercase",
			children: "Affinity"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "No docking scores in these files. Type an affinity on each pose, or add REMARK affinity lines from Vina, GNINA, Glide, GOLD."
		})]
	});
	const multiEngine = model.engines.length > 1;
	const values = model.rows.flatMap((row) => model.engines.map((engine) => row[engine]).filter((v) => typeof v === "number"));
	const min = Math.min(...values, 0);
	const max = Math.max(...values, 0);
	const pad = Math.max(.4, (max - min) * .08);
	const overlap = chartStyle === "overlay" && multiEngine;
	function copyTable() {
		navigator.clipboard.writeText(affinityTableTsv(model));
	}
	function downloadSvg() {
		const svg = wrapRef.current?.querySelector("svg");
		if (!svg) return;
		const clone = svg.cloneNode(true);
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		const vb = clone.viewBox?.baseVal;
		const w = vb?.width || Number(clone.getAttribute("width")) || 640;
		const h = vb?.height || Number(clone.getAttribute("height")) || 220;
		const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		bg.setAttribute("width", String(w));
		bg.setAttribute("height", String(h));
		bg.setAttribute("fill", "#faf9f6");
		clone.insertBefore(bg, clone.firstChild);
		const unit = document.createElementNS("http://www.w3.org/2000/svg", "text");
		unit.setAttribute("x", "8");
		unit.setAttribute("y", "16");
		unit.setAttribute("fill", "#1b1a18");
		unit.setAttribute("font-size", "12");
		unit.setAttribute("font-family", "IBM Plex Sans, sans-serif");
		unit.textContent = "Binding affinity (kcal/mol)";
		clone.appendChild(unit);
		recolorPaper(clone);
		const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>${clone.outerHTML}`], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "poseatlas-affinity-kcal-mol.svg";
		link.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-3 py-2 sm:px-4",
		"data-affinity-chart": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "Binding affinity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-muted",
					children: ["kcal/mol · more negative is stronger", multiEngine ? overlap ? " · overlapped bars, one per engine" : " · grouped by ligand, one bar per engine" : " · add another engine to overlay scores"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1",
					children: [
						multiEngine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1",
							children: ["grouped", "overlay"].map((style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setChartStyle(style),
								className: cn("rounded-md px-2.5 py-1 font-mono text-xs uppercase tracking-wide", chartStyle === style ? "bg-raised text-fg" : "text-faint hover:text-fg"),
								children: style === "grouped" ? "Grouped" : "Overlap"
							}, style))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: copyTable,
							"aria-label": "Copy affinity table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Copy"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: downloadSvg,
							"aria-label": "Download affinity chart",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "SVG"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: wrapRef,
				className: "mt-1 h-36 w-full min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: model.rows,
						margin: {
							top: 8,
							right: 12,
							left: 28,
							bottom: 4
						},
						barCategoryGap: multiEngine ? "18%" : "28%",
						barGap: overlap ? -28 : 4,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "ligand",
								tick: {
									fill: "var(--color-muted)",
									fontSize: 11,
									fontFamily: "IBM Plex Sans"
								},
								axisLine: { stroke: "var(--color-border)" },
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-muted)",
									fontSize: 11,
									fontFamily: "IBM Plex Mono"
								},
								axisLine: false,
								tickLine: false,
								width: 72,
								tickFormatter: (v) => Number(v).toFixed(1),
								domain: [Math.floor((min - pad) * 10) / 10, Math.ceil((max + pad) * 10) / 10],
								label: {
									value: "kcal/mol",
									angle: -90,
									position: "insideLeft",
									offset: 4,
									style: {
										fill: "var(--color-muted)",
										fontSize: 11,
										fontFamily: "IBM Plex Sans, sans-serif",
										textAnchor: "middle"
									}
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								y: 0,
								stroke: "var(--color-faint)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: {
									fill: "var(--color-raised)",
									opacity: .6
								},
								contentStyle: {
									background: "var(--color-surface)",
									border: "1px solid var(--color-border)",
									borderRadius: 8,
									fontSize: 12,
									color: "var(--color-fg)"
								},
								formatter: (value, name) => [`${formatKcal(value)} kcal/mol`, String(name)]
							}),
							model.engines.map((engine) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: engine,
								name: engine,
								fill: engineColor(engine, model.engines),
								fillOpacity: overlap ? .55 : .92,
								radius: [
									3,
									3,
									0,
									0
								],
								maxBarSize: overlap ? 42 : 36,
								children: !multiEngine ? model.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: ligandColors[String(row.ligand)] ?? engineColor(engine, model.engines) }, `${row.ligand}-${engine}`)) : null
							}, engine))
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[16rem] border-collapse text-left font-mono text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-faint",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-3 font-medium",
							children: "Ligand"
						}), model.engines.map((engine) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
							className: "py-1 pr-3 font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-1.5 rounded-full",
									style: { background: engineColor(engine, model.engines) }
								}), engine]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block font-normal text-faint",
								children: "kcal/mol"
							})]
						}, engine))]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: model.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1 pr-3 font-sans text-sm",
							children: row.ligand
						}), model.engines.map((engine) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-1 pr-3 tabular-nums",
							children: [formatKcal(row[engine]), typeof row[engine] === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-faint",
								children: "kcal/mol"
							}) : null]
						}, engine))]
					}, String(row.ligand))) })]
				})
			})
		]
	});
}
function ColumnSplit({ value, min, max, onChange, onReset, label, inverted = false }) {
	const start = (0, import_react.useRef)({
		x: 0,
		w: value
	});
	const sign = inverted ? -1 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": label,
		"aria-valuenow": value,
		"aria-valuemin": min,
		"aria-valuemax": max,
		tabIndex: 0,
		title: `${label} — drag to resize, double-click to reset`,
		className: cn("group relative z-20 hidden w-2 shrink-0 cursor-col-resize touch-none items-stretch justify-center lg:flex", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"),
		onKeyDown: (event) => {
			const step = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
			if (step) {
				event.preventDefault();
				onChange(value + sign * step);
			}
			if (event.key === "Home") {
				event.preventDefault();
				onChange(min);
			}
			if (event.key === "End") {
				event.preventDefault();
				onChange(max);
			}
		},
		onDoubleClick: () => onReset?.(),
		onPointerDown: (event) => {
			if (event.button !== 0) return;
			event.preventDefault();
			start.current = {
				x: event.clientX,
				w: value
			};
			event.currentTarget.setPointerCapture(event.pointerId);
			document.body.classList.add("is-col-resizing");
		},
		onPointerMove: (event) => {
			if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
			onChange(start.current.w + sign * (event.clientX - start.current.x));
		},
		onPointerUp: (event) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
			document.body.classList.remove("is-col-resizing");
		},
		onPointerCancel: () => document.body.classList.remove("is-col-resizing"),
		onLostPointerCapture: () => document.body.classList.remove("is-col-resizing"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "my-auto h-12 w-px rounded-full bg-border transition-colors duration-150 group-hover:bg-fg/55 group-focus-visible:bg-fg/70 group-active:bg-fg" })
	});
}
/** 2D chemical sketch: covalent graph + Kekulé orders, then OpenChemLib layout. */
function dist(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
var COV = {
	H: .31,
	C: .76,
	N: .71,
	O: .66,
	F: .57,
	P: 1.07,
	S: 1.05,
	CL: .99,
	BR: 1.14,
	I: 1.33
};
var VALENCE = {
	C: 4,
	N: 3,
	O: 2,
	S: 2,
	P: 3,
	F: 1,
	CL: 1,
	BR: 1,
	I: 1
};
function covBond(a, b) {
	const ra = COV[a.element] ?? .77;
	const rb = COV[b.element] ?? .77;
	const d = dist(a, b);
	return d > .45 && d < (ra + rb) * 1.28 + .08;
}
function canonEl(el) {
	const u = el.trim().toUpperCase();
	if (u === "CL" || u === "BR" || u === "SE" || u === "NA" || u === "ZN" || u === "FE" || u === "MG" || u === "MN") return u;
	return u.charAt(0) || "C";
}
function typicalValence(el, degree) {
	if (el === "C") return 4;
	if (el === "N") return degree >= 4 ? 4 : 3;
	if (el === "O") return 2;
	if (el === "S") return degree <= 2 ? 2 : degree <= 4 ? 4 : 6;
	if (el === "P") return degree <= 3 ? 3 : 5;
	if (el === "F" || el === "CL" || el === "BR" || el === "I") return 1;
	return 4;
}
function countExplicitH(heavy, hydro) {
	return heavy.map((h) => hydro.reduce((n, p) => n + (dist(h, p) < 1.25 ? 1 : 0), 0));
}
function sssr(nbr) {
	const n = nbr.length;
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	const walk = (start, current, path, depth) => {
		if (found.length >= 24 || depth > 8) return;
		for (const nxt of nbr[current] ?? []) {
			if (depth >= 3 && depth <= 8 && nxt === start) {
				const key = [...path].sort((a, b) => a - b).join(",");
				if (!seen.has(key)) {
					seen.add(key);
					found.push([...path]);
				}
				continue;
			}
			if (path.includes(nxt)) continue;
			walk(start, nxt, [...path, nxt], depth + 1);
		}
	};
	for (let i = 0; i < n && found.length < 24; i++) if ((nbr[i]?.length ?? 0) >= 2) walk(i, i, [i], 1);
	found.sort((a, b) => a.length - b.length || a[0] - b[0]);
	const kept = [];
	for (const ring of found) {
		const set = new Set(ring);
		if (kept.some((small) => small.every((i) => set.has(i)))) continue;
		kept.push(ring);
	}
	return kept;
}
function mul3(M, v) {
	return [
		M[0] * v[0] + M[1] * v[1] + M[2] * v[2],
		M[3] * v[0] + M[4] * v[1] + M[5] * v[2],
		M[6] * v[0] + M[7] * v[1] + M[8] * v[2]
	];
}
function powerEigen(M, seed) {
	let v = norm(seed);
	for (let k = 0; k < 28; k++) v = norm(mul3(M, v));
	return v;
}
function pca2(points) {
	const n = points.length || 1;
	const c = {
		x: points.reduce((s, p) => s + p.x, 0) / n,
		y: points.reduce((s, p) => s + p.y, 0) / n,
		z: points.reduce((s, p) => s + p.z, 0) / n
	};
	let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
	for (const p of points) {
		const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z;
		xx += dx * dx;
		xy += dx * dy;
		xz += dx * dz;
		yy += dy * dy;
		yz += dy * dz;
		zz += dz * dz;
	}
	const M = [
		xx,
		xy,
		xz,
		xy,
		yy,
		yz,
		xz,
		yz,
		zz
	];
	const u = powerEigen(M, [
		1,
		.3,
		.1
	]);
	const lambda = dot(u, mul3(M, u));
	let v = powerEigen([
		xx - lambda * u[0] * u[0],
		xy - lambda * u[0] * u[1],
		xz - lambda * u[0] * u[2],
		xy - lambda * u[1] * u[0],
		yy - lambda * u[1] * u[1],
		yz - lambda * u[1] * u[2],
		xz - lambda * u[2] * u[0],
		yz - lambda * u[2] * u[1],
		zz - lambda * u[2] * u[2]
	], [
		.2,
		1,
		.4
	]);
	v = norm(sub(v, scale(u, dot(v, u))));
	if (len(v) < 1e-6) v = norm(cross(u, [
		0,
		0,
		1
	]));
	if (len(v) < 1e-6) v = norm(cross(u, [
		1,
		0,
		0
	]));
	const w = norm(cross(u, v));
	return {
		u,
		v,
		w
	};
}
function norm(a) {
	const m = len(a) || 1;
	return [
		a[0] / m,
		a[1] / m,
		a[2] / m
	];
}
function len(a) {
	return Math.hypot(a[0], a[1], a[2]);
}
function cross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}
function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function sub(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2]
	];
}
function scale(a, s) {
	return [
		a[0] * s,
		a[1] * s,
		a[2] * s
	];
}
function rotateAbout(p, origin, ang) {
	const dx = p.x - origin.x;
	const dy = p.y - origin.y;
	const c = Math.cos(ang);
	const s = Math.sin(ang);
	return {
		x: origin.x + dx * c - dy * s,
		y: origin.y + dx * s + dy * c
	};
}
function regularizeRing(xy, ring) {
	const n = ring.length;
	if (n < 3) return;
	let cx = 0, cy = 0;
	for (const i of ring) {
		cx += xy[i].x;
		cy += xy[i].y;
	}
	cx /= n;
	cy /= n;
	let r = 0;
	let area = 0;
	for (let k = 0; k < n; k++) {
		const a = xy[ring[k]];
		const b = xy[ring[(k + 1) % n]];
		r += Math.hypot(a.x - cx, a.y - cy);
		area += a.x * b.y - b.x * a.y;
	}
	r /= n;
	const first = xy[ring[0]];
	const a0 = Math.atan2(first.y - cy, first.x - cx);
	const sign = area >= 0 ? 1 : -1;
	for (let k = 0; k < n; k++) {
		const ang = a0 + sign * (k * 2 * Math.PI / n);
		xy[ring[k]] = {
			x: cx + r * Math.cos(ang),
			y: cy + r * Math.sin(ang)
		};
	}
}
function snapRing(xy, ring, amount) {
	if (amount <= 0) return;
	const saved = ring.map((i) => ({ ...xy[i] }));
	regularizeRing(xy, ring);
	if (amount >= 1) return;
	for (let k = 0; k < ring.length; k++) {
		const i = ring[k];
		const from = saved[k];
		const to = xy[i];
		xy[i] = {
			x: from.x + (to.x - from.x) * amount,
			y: from.y + (to.y - from.y) * amount
		};
	}
}
function completeRingFromEdge(xy, ring, placed) {
	const n = ring.length;
	let s = -1;
	for (let k = 0; k < n; k++) if (placed.has(ring[k]) && placed.has(ring[(k + 1) % n])) {
		s = k;
		break;
	}
	if (s < 0) {
		regularizeRing(xy, ring);
		return;
	}
	const A = xy[ring[s]];
	const B = xy[ring[(s + 1) % n]];
	const step = 2 * Math.PI / n;
	const thirdIdx = ring[(s + 2) % n];
	let sign = 1;
	if (placed.has(thirdIdx)) {
		const plus = rotateAbout(A, B, step);
		const minus = rotateAbout(A, B, -step);
		const t = xy[thirdIdx];
		sign = Math.hypot(plus.x - t.x, plus.y - t.y) <= Math.hypot(minus.x - t.x, minus.y - t.y) ? 1 : -1;
	}
	let prev2 = { ...A };
	let prev1 = { ...B };
	for (let k = 2; k < n; k++) {
		const nxt = rotateAbout(prev2, prev1, sign * step);
		const idx = ring[(s + k) % n];
		if (!placed.has(idx)) xy[idx] = nxt;
		prev2 = prev1;
		prev1 = placed.has(idx) ? { ...xy[idx] } : nxt;
	}
}
function layoutRings(xy, rings, style) {
	const ordered = [...rings].sort((a, b) => b.length - a.length);
	if (style === "pose") {
		for (const ring of ordered) if (ring.length >= 5 && ring.length <= 7) snapRing(xy, ring, .42);
		return;
	}
	const placed = /* @__PURE__ */ new Set();
	for (const ring of ordered) {
		if (ring.length < 4 || ring.length > 8) continue;
		if (ring.filter((i) => placed.has(i)).length < 2) regularizeRing(xy, ring);
		else completeRingFromEdge(xy, ring, placed);
		for (const i of ring) placed.add(i);
	}
}
function relax(xy, nbr, bonds, rings, steps, ringLock) {
	const n = xy.length;
	const ideal = 1.15;
	const locked = /* @__PURE__ */ new Set();
	if (ringLock) {
		for (const ring of rings) if (ring.length >= 5 && ring.length <= 7) for (const i of ring) locked.add(i);
	}
	for (let step = 0; step < steps; step++) {
		const force = Array.from({ length: n }, () => ({
			x: 0,
			y: 0
		}));
		for (const b of bonds) {
			const a = xy[b.i], c = xy[b.j];
			const dx = c.x - a.x, dy = c.y - a.y;
			const d = Math.hypot(dx, dy) || 1e-4;
			const f = (d - ideal) * .2;
			const fx = dx / d * f, fy = dy / d * f;
			force[b.i].x += fx;
			force[b.i].y += fy;
			force[b.j].x -= fx;
			force[b.j].y -= fy;
		}
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
			if (nbr[i].includes(j)) continue;
			const a = xy[i], c = xy[j];
			const dx = c.x - a.x, dy = c.y - a.y;
			const d = Math.hypot(dx, dy) || 1e-4;
			if (d > 1.55) continue;
			const f = (1.55 - d) * .1;
			const fx = dx / d * f, fy = dy / d * f;
			force[i].x -= fx;
			force[i].y -= fy;
			force[j].x += fx;
			force[j].y += fy;
		}
		for (let i = 0; i < n; i++) {
			const ns = nbr[i];
			if (ns.length < 2) continue;
			const target = ns.length === 3 ? 2 * Math.PI / 3 : ns.length === 4 ? Math.PI / 2 : 2 * Math.PI / ns.length;
			const origin = xy[i];
			for (let a = 0; a < ns.length; a++) {
				const b = (a + 1) % ns.length;
				const p = xy[ns[a]], q = xy[ns[b]];
				const v1x = p.x - origin.x, v1y = p.y - origin.y;
				const v2x = q.x - origin.x, v2y = q.y - origin.y;
				const ang = Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y);
				const diff = (Math.abs(ang) - target) * .1 * Math.sign(ang || 1);
				force[ns[a]].x += -v1y * diff;
				force[ns[a]].y += v1x * diff;
				force[ns[b]].x += v2y * diff;
				force[ns[b]].y += -v2x * diff;
			}
		}
		const damp = .5;
		for (let i = 0; i < n; i++) {
			const scaleF = locked.has(i) ? .15 : 1;
			xy[i].x += force[i].x * damp * scaleF;
			xy[i].y += force[i].y * damp * scaleF;
		}
		if (ringLock && step % 10 === 9) {
			for (const ring of rings) if (ring.length >= 5 && ring.length <= 7) regularizeRing(xy, ring);
		}
	}
}
function orientLandscape(xy) {
	const n = xy.length || 1;
	const cx = xy.reduce((s, p) => s + p.x, 0) / n;
	const cy = xy.reduce((s, p) => s + p.y, 0) / n;
	let xx = 0, xyC = 0, yy = 0;
	for (const p of xy) {
		const dx = p.x - cx, dy = p.y - cy;
		xx += dx * dx;
		xyC += dx * dy;
		yy += dy * dy;
	}
	const ang = .5 * Math.atan2(2 * xyC, xx - yy);
	const c = Math.cos(-ang);
	const s = Math.sin(-ang);
	for (const p of xy) {
		const dx = p.x - cx, dy = p.y - cy;
		p.x = cx + dx * c - dy * s;
		p.y = cy + dx * s + dy * c;
	}
	const spanX = Math.max(...xy.map((p) => p.x)) - Math.min(...xy.map((p) => p.x));
	if (Math.max(...xy.map((p) => p.y)) - Math.min(...xy.map((p) => p.y)) > spanX) for (const p of xy) {
		const dx = p.x - cx;
		p.x = cx - (p.y - cy);
		p.y = cy + dx;
	}
}
function implicitH(element, orders, neighbors, aromatic) {
	const v = VALENCE[element];
	if (v == null) return 0;
	if (element === "N" && aromatic && neighbors === 2) {
		const need = Math.max(0, Math.round(v - orders));
		return need > 1 ? 1 : need;
	}
	return Math.max(0, Math.round(v - orders));
}
function prettyElement(element) {
	if (element === "CL") return "Cl";
	if (element === "BR") return "Br";
	return element[0] + element.slice(1).toLowerCase();
}
function elementLabel(element, h) {
	if (element === "C") return "";
	const el = prettyElement(element);
	if (h <= 0) return el;
	if (h === 1) return `${el}H`;
	return `${el}H${h}`;
}
function hillFormula(heavy, hs) {
	const counts = /* @__PURE__ */ new Map();
	const add = (el, n = 1) => counts.set(el, (counts.get(el) ?? 0) + n);
	for (let i = 0; i < heavy.length; i++) {
		add(heavy[i].element);
		if (hs[i]) add("H", hs[i]);
	}
	const parts = [];
	const emit = (el) => {
		const n = counts.get(el);
		if (!n) return;
		parts.push(n === 1 ? prettyElement(el) : `${prettyElement(el)}${n}`);
		counts.delete(el);
	};
	emit("C");
	emit("H");
	for (const el of [...counts.keys()].sort()) emit(el);
	return parts.join("");
}
function isAromaticRing(heavy, ring, nbr) {
	if (ring.length !== 5 && ring.length !== 6) return false;
	for (const i of ring) {
		const el = heavy[i].element;
		if (!(el === "C" || el === "N" || el === "O" || el === "S")) return false;
		if ((nbr[i]?.length ?? 0) > 3) return false;
	}
	let mean = 0;
	for (let k = 0; k < ring.length; k++) mean += dist(heavy[ring[k]], heavy[ring[(k + 1) % ring.length]]);
	mean /= ring.length;
	return mean < 1.46;
}
function assignBondOrders(heavy, nbr, rings, explicitH, hasHydrogens) {
	const n = heavy.length;
	const raw = [];
	for (let i = 0; i < n; i++) for (const j of nbr[i] ?? []) {
		if (j <= i) continue;
		raw.push({
			i,
			j,
			d: dist(heavy[i], heavy[j]),
			order: 1
		});
	}
	const remaining = heavy.map((atom, i) => Math.max(0, typicalValence(atom.element, nbr[i].length) - nbr[i].length - (hasHydrogens ? explicitH[i] : 0)));
	const bump = (b, extra = 1) => {
		if (remaining[b.i] < extra || remaining[b.j] < extra) return false;
		b.order += extra;
		remaining[b.i] -= extra;
		remaining[b.j] -= extra;
		return true;
	};
	const sorted = [...raw].sort((a, b) => a.d - b.d);
	for (const b of sorted) {
		const pair = [heavy[b.i].element, heavy[b.j].element].sort().join("");
		if (pair === "CC" && b.d < 1.22) bump(b, 2) || bump(b);
		else if (pair === "CC" && b.d < 1.32) bump(b);
		else if (pair === "CO" && b.d < 1.3) bump(b);
		else if (pair === "CN" && b.d < 1.32) bump(b);
		else if (pair === "CS" && b.d < 1.6) bump(b);
		else if (pair === "NO" && b.d < 1.25) bump(b);
		else if (pair === "PO" && b.d < 1.55) bump(b);
	}
	const byKey = new Map(raw.map((b) => [b.i < b.j ? `${b.i}-${b.j}` : `${b.j}-${b.i}`, b]));
	const aromaticAtoms = /* @__PURE__ */ new Set();
	for (const ring of rings) {
		if (ring.length !== 5 && ring.length !== 6) continue;
		if (!isAromaticRing(heavy, ring, nbr)) continue;
		for (const i of ring) aromaticAtoms.add(i);
		const edges = [];
		for (let k = 0; k < ring.length; k++) {
			const a = ring[k];
			const c = ring[(k + 1) % ring.length];
			const b = byKey.get(a < c ? `${a}-${c}` : `${c}-${a}`);
			if (b) edges.push(b);
		}
		edges.sort((a, b) => remaining[b.i] + remaining[b.j] - (remaining[a.i] + remaining[a.j]));
		for (const b of edges) {
			if (b.order >= 2) continue;
			if (edges.some((e) => e !== b && e.order >= 2 && (e.i === b.i || e.i === b.j || e.j === b.i || e.j === b.j))) continue;
			bump(b);
		}
	}
	if (hasHydrogens) for (const b of sorted) bump(b);
	return raw.map((b) => ({
		i: b.i,
		j: b.j,
		order: b.order >= 3 ? 3 : b.order >= 2 ? 2 : 1,
		stereo: "none",
		aromatic: aromaticAtoms.has(b.i) && aromaticAtoms.has(b.j)
	}));
}
function centroid2(pts) {
	const n = pts.length || 1;
	return {
		x: pts.reduce((s, p) => s + p.x, 0) / n,
		y: pts.reduce((s, p) => s + p.y, 0) / n
	};
}
function kabschAlign(src, dst) {
	if (src.length !== dst.length || src.length < 2) return src.map((p) => ({ ...p }));
	const cs = centroid2(src);
	const cd = centroid2(dst);
	const from = src.map((p) => ({
		x: p.x - cs.x,
		y: p.y - cs.y
	}));
	const to = dst.map((p) => ({
		x: p.x - cd.x,
		y: p.y - cd.y
	}));
	const score = (flipped) => {
		const pts = from.map((p) => ({
			x: p.x,
			y: flipped ? -p.y : p.y
		}));
		let xx = 0, xy = 0, yx = 0, yy = 0;
		for (let i = 0; i < pts.length; i++) {
			xx += pts[i].x * to[i].x;
			xy += pts[i].x * to[i].y;
			yx += pts[i].y * to[i].x;
			yy += pts[i].y * to[i].y;
		}
		const A = xx + yy;
		const B = xy - yx;
		const nrm = Math.hypot(A, B) || 1;
		const c = A / nrm;
		const s = B / nrm;
		let e = 0;
		const out = pts.map((p, i) => {
			const x = c * p.x - s * p.y;
			const y = s * p.x + c * p.y;
			e += (x - to[i].x) ** 2 + (y - to[i].y) ** 2;
			return {
				x: x + cd.x,
				y: y + cd.y
			};
		});
		return {
			e,
			out
		};
	};
	const a = score(false);
	const b = score(true);
	return a.e <= b.e ? a.out : b.out;
}
function oclAtomicNo(element) {
	const label = element === "CL" ? "Cl" : element === "BR" ? "Br" : element === "NA" ? "Na" : element === "SE" ? "Se" : prettyElement(element);
	const n = Uot.getAtomicNoFromLabel(label);
	return n > 0 ? n : 6;
}
function oclBondType(order) {
	if (order >= 2.5) return Uot.cBondTypeTriple;
	if (order >= 1.6) return Uot.cBondTypeDouble;
	return Uot.cBondTypeSingle;
}
var chemSvgId = 0;
function themeChemSvg(svg) {
	return svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/stroke="rgb\(\s*0,\s*0,\s*0\s*\)"/g, "stroke=\"#c8ccd4\"").replace(/fill="rgb\(\s*0,\s*0,\s*0\s*\)"/g, "fill=\"#f4f1ea\"").replace(/stroke="#000000"/gi, "stroke=\"#c8ccd4\"").replace(/fill="#000000"/gi, "fill=\"#f4f1ea\"").replace(/stroke="black"/gi, "stroke=\"#c8ccd4\"").replace(/fill="black"/gi, "fill=\"#f4f1ea\"");
}
function moleculeFromSketch(heavy, bonds) {
	const mol = new Uot(heavy.length + 8, bonds.length + 8);
	for (const atom of heavy) {
		const i = mol.addAtom(oclAtomicNo(atom.element));
		mol.setAtomX(i, atom.x);
		mol.setAtomY(i, atom.y);
		mol.setAtomZ(i, atom.z);
	}
	for (const b of bonds) {
		const idx = mol.addBond(b.i, b.j);
		mol.setBondType(idx, oclBondType(b.order));
	}
	mol.ensureHelperArrays(Uot.cHelperRings);
	return mol;
}
function applyCheminformatics(sketch, heavy, style, poseTarget) {
	if (!sketch.atoms.length) return sketch;
	try {
		const mol = moleculeFromSketch(heavy, sketch.bonds);
		mol.ensureHelperArrays(Uot.cHelperRings);
		mol.inventCoordinates({ seed: 0 });
		const invented = sketch.atoms.map((_, i) => ({
			x: mol.getAtomX(i),
			y: -mol.getAtomY(i)
		}));
		const laid = style === "pose" && poseTarget && poseTarget.length === invented.length ? kabschAlign(invented, poseTarget) : invented;
		if (style !== "pose") orientLandscape(laid);
		for (let i = 0; i < sketch.atoms.length; i++) {
			sketch.atoms[i].x = laid[i].x;
			sketch.atoms[i].y = laid[i].y;
		}
		const hs = sketch.atoms.map((_, i) => {
			try {
				return Math.max(0, mol.getImplicitHydrogens(i) | 0);
			} catch {
				return sketch.atoms[i].implicitH;
			}
		});
		for (let i = 0; i < sketch.atoms.length; i++) {
			sketch.atoms[i].implicitH = hs[i];
			sketch.atoms[i].label = elementLabel(sketch.atoms[i].element, hs[i]);
		}
		try {
			sketch.formula = mol.getMolecularFormula()?.formula || hillFormula(heavy, hs);
		} catch {
			sketch.formula = hillFormula(heavy, hs);
		}
		const nBonds = mol.getAllBonds();
		const byPair = new Map(sketch.bonds.map((b) => [b.i < b.j ? `${b.i}-${b.j}` : `${b.j}-${b.i}`, b]));
		for (let b = 0; b < nBonds; b++) {
			const i = mol.getBondAtom(0, b);
			const j = mol.getBondAtom(1, b);
			const rec = byPair.get(i < j ? `${i}-${j}` : `${j}-${i}`);
			if (!rec) continue;
			const simple = mol.getBondTypeSimple(b);
			if (simple === Uot.cBondTypeTriple) rec.order = 3;
			else if (simple === Uot.cBondTypeDouble) rec.order = 2;
			else if (simple === Uot.cBondTypeSingle) rec.order = rec.aromatic ? rec.order : 1;
			rec.stereo = "none";
		}
		try {
			sketch.smiles = mol.toIsomericSmiles();
		} catch {
			sketch.smiles = void 0;
		}
		if (style === "schematic") try {
			sketch.svg = themeChemSvg(mol.toSVG(420, 220, `chem${++chemSvgId}`, {
				suppressChiralText: true,
				suppressESR: true,
				noStereoProblem: true,
				autoCrop: true,
				autoCropMargin: 12,
				strokeWidth: 1.45,
				factorTextSize: 1
			}));
		} catch {
			sketch.svg = void 0;
		}
		return sketch;
	} catch {
		return sketch;
	}
}
function buildSketch(input, style = "schematic") {
	const atoms = input.map((a) => ({
		...a,
		element: canonEl(a.element)
	}));
	const hydro = atoms.filter((a) => a.element === "H");
	const heavy = atoms.filter((a) => a.element !== "H");
	const n = heavy.length;
	if (n === 0) return {
		atoms: [],
		bonds: [],
		rings: [],
		formula: ""
	};
	const nbr = Array.from({ length: n }, () => []);
	for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
		if (!covBond(heavy[i], heavy[j])) continue;
		nbr[i].push(j);
		nbr[j].push(i);
	}
	const rings = sssr(nbr);
	const hasHydrogens = hydro.length >= 3;
	const explicitH = countExplicitH(heavy, hydro);
	const bonds = assignBondOrders(heavy, nbr, rings, explicitH, hasHydrogens);
	const { u, v } = pca2(heavy);
	const c = {
		x: heavy.reduce((s, a) => s + a.x, 0) / n,
		y: heavy.reduce((s, a) => s + a.y, 0) / n,
		z: heavy.reduce((s, a) => s + a.z, 0) / n
	};
	const xy = heavy.map((a) => {
		const d = [
			a.x - c.x,
			a.y - c.y,
			a.z - c.z
		];
		return {
			x: dot(d, u),
			y: dot(d, v)
		};
	});
	layoutRings(xy, rings, style);
	if (style === "schematic") {
		relax(xy, nbr, bonds, rings, 56, true);
		orientLandscape(xy);
	} else relax(xy, nbr, bonds, rings, 14, false);
	const orderSum = Array.from({ length: n }, () => 0);
	for (const b of bonds) {
		orderSum[b.i] += b.order;
		orderSum[b.j] += b.order;
	}
	const aromaticAtoms = /* @__PURE__ */ new Set();
	for (const b of bonds) if (b.aromatic) {
		aromaticAtoms.add(b.i);
		aromaticAtoms.add(b.j);
	}
	const hs = hasHydrogens ? explicitH : heavy.map((atom, index) => implicitH(atom.element, orderSum[index], nbr[index].length, aromaticAtoms.has(index)));
	return applyCheminformatics({
		atoms: heavy.map((atom, index) => ({
			index,
			atom,
			x: xy[index].x,
			y: xy[index].y,
			element: atom.element,
			label: elementLabel(atom.element, hs[index]),
			implicitH: hs[index]
		})),
		bonds,
		rings,
		formula: hillFormula(heavy, hs)
	}, heavy, style, xy);
}
function fitSketch(sketch, width, height, pad) {
	if (!sketch.atoms.length) return sketch;
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	for (const a of sketch.atoms) {
		minX = Math.min(minX, a.x);
		maxX = Math.max(maxX, a.x);
		minY = Math.min(minY, a.y);
		maxY = Math.max(maxY, a.y);
	}
	const sx = (width - pad * 2) / Math.max(.001, maxX - minX);
	const sy = (height - pad * 2) / Math.max(.001, maxY - minY);
	const s = Math.min(sx, sy);
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	return {
		...sketch,
		atoms: sketch.atoms.map((a) => ({
			...a,
			x: width / 2 + (a.x - cx) * s,
			y: height / 2 + (a.y - cy) * s
		}))
	};
}
var TYPE_STROKE = {
	hbond: "var(--color-int-hbond)",
	salt: "var(--color-int-salt)",
	hydrophobic: "var(--color-int-hydrophobic)",
	"pi-stack": "var(--color-int-pi)",
	"pi-cation": "var(--color-int-pi)",
	contact: "var(--color-faint)"
};
var BOND = "var(--color-accent)";
var CHIP_W = 64;
var CHIP_H = 30;
var MAP_W = 520;
var MAP_H = 292;
function perp(dx, dy, scale) {
	const m = Math.hypot(dx, dy) || 1;
	return {
		x: -dy / m * scale,
		y: dx / m * scale
	};
}
function trimBond(a, b, trimA, trimB) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const m = Math.hypot(dx, dy) || 1;
	const ux = dx / m;
	const uy = dy / m;
	return {
		x1: a.x + ux * trimA,
		y1: a.y + uy * trimA,
		x2: b.x - ux * trimB,
		y2: b.y - uy * trimB
	};
}
function atomTrim(sketch, index) {
	return sketch.atoms[index].label ? 7 : 0;
}
function ringCentroid(sketch, bond) {
	for (const ring of sketch.rings) {
		if (ring.length < 4) continue;
		if (!ring.includes(bond.i) || !ring.includes(bond.j)) continue;
		let x = 0, y = 0;
		for (const i of ring) {
			x += sketch.atoms[i].x;
			y += sketch.atoms[i].y;
		}
		return {
			x: x / ring.length,
			y: y / ring.length
		};
	}
	return null;
}
function BondMarks({ bond, sketch }) {
	const a = sketch.atoms[bond.i];
	const b = sketch.atoms[bond.j];
	const t = trimBond(a, b, atomTrim(sketch, bond.i), atomTrim(sketch, bond.j));
	const dx = t.x2 - t.x1;
	const dy = t.y2 - t.y1;
	if (bond.stereo === "wedge") {
		const p = perp(dx, dy, 5.2);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
			points: `${t.x1},${t.y1} ${t.x2 + p.x},${t.y2 + p.y} ${t.x2 - p.x},${t.y2 - p.y}`,
			fill: BOND
		});
	}
	if (bond.stereo === "dash") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Array.from({ length: 7 }, (_, k) => {
		const u = (k + 1) / 8;
		const w = .8 + u * 4.6;
		const p = perp(dx, dy, w);
		const x = t.x1 + dx * u;
		const y = t.y1 + dy * u;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: x - p.x,
			y1: y - p.y,
			x2: x + p.x,
			y2: y + p.y,
			stroke: BOND,
			strokeWidth: 1.15,
			strokeLinecap: "round"
		}, k);
	}) });
	const lines = bond.order >= 2.5 ? 3 : bond.order >= 1.6 ? 2 : 1;
	if (lines === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: t.x1,
		y1: t.y1,
		x2: t.x2,
		y2: t.y2,
		stroke: BOND,
		strokeWidth: 1.55,
		strokeLinecap: "round"
	});
	const mid = {
		x: (t.x1 + t.x2) / 2,
		y: (t.y1 + t.y2) / 2
	};
	const centroid = ringCentroid(sketch, bond);
	let off = perp(dx, dy, 2.9);
	if (centroid) {
		const toward = {
			x: centroid.x - mid.x,
			y: centroid.y - mid.y
		};
		if (off.x * toward.x + off.y * toward.y < 0) off = {
			x: -off.x,
			y: -off.y
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: t.x1,
			y1: t.y1,
			x2: t.x2,
			y2: t.y2,
			stroke: BOND,
			strokeWidth: 1.4,
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: t.x1 + off.x,
			y1: t.y1 + off.y,
			x2: t.x2 + off.x,
			y2: t.y2 + off.y,
			stroke: BOND,
			strokeWidth: 1.2,
			strokeLinecap: "round"
		}),
		lines === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: t.x1 - off.x,
			y1: t.y1 - off.y,
			x2: t.x2 - off.x,
			y2: t.y2 - off.y,
			stroke: BOND,
			strokeWidth: 1.15,
			strokeLinecap: "round"
		}) : null
	] });
}
function LigandDrawing({ sketch, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [sketch.bonds.map((bond, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BondMarks, {
		bond,
		sketch
	}, `b-${i}`)), sketch.atoms.map((a) => {
		const marked = highlight?.has(a.atom.name);
		const text = a.label;
		if (!text && !marked) return null;
		const fill = CPK[a.element] ?? CPK.C;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: text ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: a.x,
			cy: a.y,
			r: 6.6,
			fill: "var(--color-surface)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: a.x,
			y: a.y + 3,
			textAnchor: "middle",
			fill,
			fontSize: 9,
			fontFamily: "IBM Plex Sans, ui-sans-serif, sans-serif",
			fontWeight: 600,
			children: text
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: a.x,
			cy: a.y,
			r: 2.1,
			fill,
			opacity: .85
		}) }, `a-${a.index}`);
	})] });
}
function wrapAngle(a) {
	let x = a;
	while (x <= -Math.PI) x += Math.PI * 2;
	while (x > Math.PI) x -= Math.PI * 2;
	return x;
}
function ellipsePoint(cx, cy, rx, ry, angle) {
	return {
		x: cx + Math.cos(angle) * rx,
		y: cy + Math.sin(angle) * ry
	};
}
function assignEvenAngles(preferred) {
	const n = preferred.length;
	if (!n) return [];
	const step = Math.PI * 2 / n;
	const order = preferred.map((_, i) => i).sort((a, b) => preferred[a] - preferred[b]);
	const offset = preferred[order[0]] + Math.PI - step / 2;
	const slots = Array.from({ length: n }, (_, k) => wrapAngle(offset + k * step));
	const used = /* @__PURE__ */ new Set();
	const out = Array.from({ length: n }, () => 0);
	for (const i of order) {
		let best = -1;
		let bestD = Infinity;
		for (let k = 0; k < n; k++) {
			if (used.has(k)) continue;
			const d = Math.abs(wrapAngle(preferred[i] - slots[k]));
			if (d < bestD) {
				bestD = d;
				best = k;
			}
		}
		used.add(best);
		out[i] = slots[best];
	}
	return out;
}
function placeResidues(sketch, hits, W, H) {
	const groups = /* @__PURE__ */ new Map();
	for (const hit of hits) {
		const key = `${hit.chain}:${hit.resSeq}`;
		const list = groups.get(key);
		if (list) list.push(hit);
		else groups.set(key, [hit]);
	}
	const limited = [...groups.values()].sort((a, b) => {
		const rank = (g) => g.some((h) => h.type === "hbond" || h.type === "salt" || h.type.startsWith("pi")) ? 0 : 1;
		return rank(a) - rank(b) || a[0].distance - b[0].distance;
	}).slice(0, 7);
	const cx = sketch.atoms.reduce((s, a) => s + a.x, 0) / Math.max(sketch.atoms.length, 1);
	const cy = sketch.atoms.reduce((s, a) => s + a.y, 0) / Math.max(sketch.atoms.length, 1);
	const rx = W / 2 - CHIP_W / 2 - 8;
	const ry = H / 2 - CHIP_H / 2 - 8;
	const raw = limited.map((group, i, all) => {
		const hit = group[0];
		const targets = group.map((h) => sketch.atoms.find((a) => a.atom.name === h.ligandAtom)).filter((a) => Boolean(a));
		const aim = targets.length ? {
			x: targets.reduce((s, a) => s + a.x, 0) / targets.length,
			y: targets.reduce((s, a) => s + a.y, 0) / targets.length
		} : {
			x: cx,
			y: cy
		};
		const base = Math.atan2(aim.y - cy, aim.x - cx);
		return {
			hit,
			group,
			targets,
			angle: wrapAngle(Number.isFinite(base) ? base : i / Math.max(all.length, 1) * Math.PI * 2 - Math.PI / 2)
		};
	});
	const placed = assignEvenAngles(raw.map((r) => r.angle));
	return raw.map((r, i) => ({
		hit: r.hit,
		group: r.group,
		targets: r.targets,
		p: ellipsePoint(cx, cy, rx, ry, placed[i])
	}));
}
function shortenToChip(from, to) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const m = Math.hypot(dx, dy) || 1;
	const ux = dx / m;
	const uy = dy / m;
	const tx = ux === 0 ? Infinity : (CHIP_W / 2 - 2) / Math.abs(ux);
	const ty = uy === 0 ? Infinity : (CHIP_H / 2 - 2) / Math.abs(uy);
	const cut = Math.min(tx, ty);
	return {
		x: to.x - ux * cut,
		y: to.y - uy * cut
	};
}
function Diagram2D({ ligand, hits, ligandName, otherLigands = [] }) {
	const pose = (0, import_react.useMemo)(() => buildSketch(ligand, "pose"), [ligand]);
	const schematic = (0, import_react.useMemo)(() => buildSketch(ligand, "schematic"), [ligand]);
	const map = (0, import_react.useMemo)(() => {
		if (pose.atoms.length < 2) return null;
		const sketch = fitSketch(pose, MAP_W, MAP_H, 88);
		return {
			sketch,
			residues: placeResidues(sketch, hits, MAP_W, MAP_H),
			cx: sketch.atoms.reduce((s, a) => s + a.x, 0) / sketch.atoms.length,
			cy: sketch.atoms.reduce((s, a) => s + a.y, 0) / sketch.atoms.length
		};
	}, [pose, hits]);
	const overlaySketches = (0, import_react.useMemo)(() => otherLigands.filter((item) => item.atoms.length > 1).slice(0, 4).map((item) => ({
		name: item.name,
		sketch: buildSketch(item.atoms, "schematic")
	})), [otherLigands]);
	const contactNames = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const h of hits) set.add(h.ligandAtom);
		return set;
	}, [hits]);
	if (!map) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-4 py-3 text-sm text-muted",
		children: "Need a ligand to draw a 2D map."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col px-2 pb-3 pt-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			id: "figure-2d",
			className: "figure-2d flex flex-col gap-1.5 rounded-2xl border border-border p-2.5",
			"aria-label": `${ligandName} 2D figure`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-baseline justify-between gap-3 px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: ["Pose 2D · ", ligandName]
					}), pose.formula ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tabular-nums text-muted",
						children: pose.formula
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: `0 0 ${MAP_W} ${MAP_H}`,
					className: "w-full shrink-0 rounded-lg bg-bg",
					role: "img",
					"aria-label": "Ligand–residue interaction diagram",
					children: [
						map.residues.map(({ group, targets, p, hit }) => (targets.length ? targets : [{
							x: map.cx,
							y: map.cy
						}]).map((t, i) => {
							const end = shortenToChip(t, p);
							const kind = group[i]?.type ?? hit.type;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: t.x,
								y1: t.y,
								x2: end.x,
								y2: end.y,
								stroke: TYPE_STROKE[kind] ?? "var(--color-faint)",
								strokeWidth: 1.35,
								strokeDasharray: kind === "hbond" || kind === "salt" ? "3.5 2.5" : "0",
								opacity: .9
							}, `l-${hit.chain}-${hit.resSeq}-${i}`);
						})),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LigandDrawing, {
							sketch: map.sketch,
							highlight: contactNames
						}),
						map.residues.map(({ hit, group, p }) => {
							const dmin = Math.min(...group.map((g) => g.distance));
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									x: p.x - CHIP_W / 2,
									y: p.y - CHIP_H / 2,
									width: CHIP_W,
									height: CHIP_H,
									rx: 5,
									fill: "var(--color-surface)",
									stroke: "var(--color-border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: p.x,
									y: p.y - 2,
									textAnchor: "middle",
									fill: "var(--color-fg)",
									fontSize: "9",
									fontFamily: "IBM Plex Mono, ui-monospace, monospace",
									children: prettyResidue(hit.resName, hit.resSeq, hit.chain)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
									x: p.x,
									y: p.y + 10,
									textAnchor: "middle",
									fill: "var(--color-muted)",
									fontSize: "7.5",
									fontFamily: "IBM Plex Mono, ui-monospace, monospace",
									children: [dmin.toFixed(1), " Å"]
								})
							] }, `r-${hit.chain}-${hit.resSeq}`);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap gap-x-3 gap-y-1 px-1 font-mono text-xs text-muted",
					children: Object.entries(INTERACTION_LABEL).map(([k, lab]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-px w-3",
							style: { background: TYPE_STROKE[k] }
						}), lab]
					}, k))
				}),
				schematic.smiles ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-bg px-3 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: "SMILES"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-all font-mono text-xs leading-snug text-muted",
						"data-smiles": true,
						children: schematic.smiles
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-bg px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-faint uppercase",
							children: "Skeletal"
						}), schematic.formula ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tabular-nums text-muted",
							children: schematic.formula
						}) : null]
					}), schematic.svg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "chem-svg mt-1",
						dangerouslySetInnerHTML: { __html: schematic.svg }
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 py-6 text-xs text-muted",
						children: "No ligand"
					})]
				})
			]
		}), overlaySketches.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 grid grid-cols-2 gap-2 px-1",
			children: overlaySketches.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-surface px-2 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-1 font-mono text-xs tracking-widest text-faint uppercase",
					children: item.name
				}), item.sketch.svg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chem-svg mt-1",
					dangerouslySetInnerHTML: { __html: item.sketch.svg }
				}) : null]
			}, item.name))
		}) : null]
	});
}
var MODES = [
	{
		id: "interaction",
		label: "Bonds",
		hint: "Cartoon + contacting side chains"
	},
	{
		id: "pocket",
		label: "Pocket",
		hint: "Cutaway pocket surface"
	},
	{
		id: "electrostatic",
		label: "Electro",
		hint: "Coulombic SAS"
	},
	{
		id: "hydrophobic",
		label: "Hydro",
		hint: "Kyte–Doolittle hydropathy"
	}
];
function FigureToolbar({ mode, spin, frame, labelsOn, overlay, chartOpen, sceneCount, saveLabel, onMode, onSpin, onFrame, onLabels, onOverlayAll, onChart, onSnapshot, onDownload, onScene }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5 px-3 py-2 sm:px-4 lg:flex-row lg:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-4 gap-1 rounded-lg bg-raised p-1 lg:w-[28rem] lg:shrink-0",
			role: "tablist",
			"aria-label": "Pose representation",
			children: MODES.map((item) => {
				const active = mode === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": active,
					title: item.hint,
					onClick: () => onMode(item.id),
					className: cn("min-h-10 rounded-md px-2 text-sm font-medium transition-colors duration-150", active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"),
					children: item.label
				}, item.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-1 overflow-x-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: frame === "ligand" ? "secondary" : "ghost",
					onClick: onFrame,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scan, {}), frame === "ligand" ? "Ligand" : "Complex"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: spin ? "secondary" : "ghost",
					onClick: onSpin,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {}), "Spin"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: labelsOn ? "secondary" : "ghost",
					onClick: onLabels,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {}), "Labels"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: overlay ? "secondary" : "ghost",
					onClick: onOverlayAll,
					className: cn(overlay && "text-fg"),
					children: "Overlay"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: chartOpen ? "secondary" : "ghost",
					onClick: onChart,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {}), "Chart"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex shrink-0 items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: onSnapshot,
							"aria-label": "Save to scene",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), saveLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: onDownload,
							"aria-label": "Download PNG",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: sceneCount ? "secondary" : "ghost",
							onClick: onScene,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutTemplate, {}),
								"Figures",
								sceneCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs tabular-nums text-muted",
									children: sceneCount
								}) : null
							]
						})
					]
				})
			]
		})]
	});
}
var BG = "#faf9f6";
var SURFACE = "#ffffff";
var FG = "#1b1a18";
var MUTED$1 = "#5c5a54";
var FAINT = "#8a8780";
var BORDER = "#d8d2c6";
var SS_COLOR = {
	helix: "#c97878",
	sheet: "#7a9ed4",
	turn: "#6aaa8c",
	coil: "#8a8c90"
};
function roundRect(ctx, x, y, w, h, r) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not read panel image"));
		img.src = src;
	});
}
function drawCover(ctx, img, x, y, w, h) {
	const scale = Math.max(w / img.width, h / img.height);
	const dw = img.width * scale;
	const dh = img.height * scale;
	const dx = x + (w - dw) / 2;
	const dy = y + (h - dh) / 2;
	ctx.save();
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	ctx.drawImage(img, dx, dy, dw, dh);
	ctx.restore();
}
function paintSsReport(ctx, ss, x, y, w, h, interacting) {
	ctx.fillStyle = SURFACE;
	roundRect(ctx, x, y, w, h, 12);
	ctx.fill();
	const pad = 22;
	ctx.fillStyle = FAINT;
	ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.fillText("KABSCH–SANDER DSSP", x + pad, y + 28);
	const barY = y + 44;
	const barH = 10;
	const barW = w - 44;
	let bx = x + pad;
	for (const key of [
		"helix",
		"sheet",
		"turn",
		"coil"
	]) {
		const frac = ss.percents[key] / 100;
		ctx.fillStyle = SS_COLOR[key];
		ctx.fillRect(bx, barY, barW * frac, barH);
		bx += barW * frac;
	}
	ctx.font = "12px 'IBM Plex Sans', sans-serif";
	let lx = x + pad;
	for (const [key, lab] of [
		["helix", "Helix"],
		["sheet", "Sheet"],
		["turn", "Turn"],
		["coil", "Coil"]
	]) {
		ctx.fillStyle = SS_COLOR[key];
		ctx.fillText(`${lab}  ${ss.percents[key].toFixed(0)}%`, lx, y + 72);
		lx += 110;
	}
	const stripY = y + 92;
	const stripH = 16;
	const n = Math.max(ss.residues.length, 1);
	const unit = (w - 44) / n;
	ss.residues.forEach((r, i) => {
		ctx.fillStyle = SS_COLOR[ssGroup(r.ss)];
		ctx.fillRect(x + pad + i * unit, stripY, Math.max(unit, 1), stripH);
		if (interacting.has(`${r.chain}:${r.resSeq}`)) {
			ctx.fillStyle = "rgba(244,241,234,0.85)";
			ctx.fillRect(x + pad + i * unit, stripY - 3, Math.max(unit, 1), 3);
		}
	});
	ctx.fillStyle = MUTED$1;
	ctx.font = "12px 'IBM Plex Sans', sans-serif";
	const first = ss.residues[0];
	const last = ss.residues[ss.residues.length - 1];
	if (first && last) {
		ctx.fillText(`${first.resName}${first.resSeq}`, x + pad, stripY + 34);
		ctx.textAlign = "right";
		ctx.fillText(`${last.resName}${last.resSeq}`, x + w - pad, stripY + 34);
		ctx.textAlign = "left";
	}
	const counts = ss.residues.reduce((acc, r) => {
		acc[ssGroup(r.ss)] += 1;
		return acc;
	}, {
		helix: 0,
		sheet: 0,
		turn: 0,
		coil: 0
	});
	ctx.fillStyle = FAINT;
	ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.fillText(`${ss.residues.length} residues · H ${counts.helix}  E ${counts.sheet}  T ${counts.turn}  C ${counts.coil}`, x + pad, y + h - 18);
}
function paintAffinityChart(ctx, chart, x, y, w, h, ligandColors, style) {
	ctx.fillStyle = SURFACE;
	roundRect(ctx, x, y, w, h, 12);
	ctx.fill();
	const pad = 22;
	ctx.fillStyle = FAINT;
	ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.fillText("BINDING AFFINITY  (kcal/mol)", x + pad, y + 28);
	const values = chart.rows.flatMap((row) => chart.engines.map((engine) => row[engine]).filter((v) => typeof v === "number"));
	if (!values.length) {
		ctx.fillStyle = MUTED$1;
		ctx.font = "13px 'IBM Plex Sans', sans-serif";
		ctx.fillText("No scored poses", x + pad, y + 64);
		return;
	}
	const min = Math.min(...values, 0);
	const max = Math.max(...values, 0);
	const span = Math.max(.8, max - min);
	const plotX = x + pad + 52;
	const plotY = y + 48;
	const plotW = w - 44 - 52;
	const plotH = h - 96;
	const zero = plotY + (0 - min) / span * plotH;
	const multi = chart.engines.length > 1;
	const groupW = plotW / Math.max(chart.rows.length, 1);
	ctx.save();
	ctx.translate(x + pad + 10, plotY + plotH / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillStyle = FAINT;
	ctx.font = "11px 'IBM Plex Sans', sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("kcal/mol", 0, 0);
	ctx.restore();
	ctx.strokeStyle = BORDER;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(plotX, plotY);
	ctx.lineTo(plotX, plotY + plotH);
	ctx.lineTo(plotX + plotW, plotY + plotH);
	ctx.stroke();
	ctx.strokeStyle = "rgba(27,26,24,0.16)";
	ctx.beginPath();
	ctx.moveTo(plotX, zero);
	ctx.lineTo(plotX + plotW, zero);
	ctx.stroke();
	ctx.fillStyle = FAINT;
	ctx.font = "10px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.textAlign = "right";
	ctx.fillText(min.toFixed(1), plotX - 8, plotY + plotH);
	ctx.fillText("0", plotX - 8, zero + 3);
	ctx.textAlign = "left";
	chart.rows.forEach((row, i) => {
		const cx = plotX + (i + .5) * groupW;
		const engines = chart.engines.filter((engine) => typeof row[engine] === "number");
		const barW = style === "overlay" && multi ? Math.min(28, groupW * .4) : Math.min(22, groupW * .7 / Math.max(engines.length, 1));
		engines.forEach((engine, e) => {
			const bh = (row[engine] - min) / span * plotH - (0 - min) / span * plotH;
			const bx = style === "overlay" && multi ? cx - barW / 2 : cx - engines.length * (barW + 3) / 2 + e * (barW + 3);
			const color = ligandColors[String(row.ligand)] ?? engineColor(engine, chart.engines);
			ctx.globalAlpha = style === "overlay" && multi ? .55 : .92;
			ctx.fillStyle = color;
			ctx.fillRect(bx, Math.min(zero, zero - bh), barW, Math.abs(bh));
			ctx.globalAlpha = 1;
		});
		ctx.fillStyle = MUTED$1;
		ctx.font = "12px 'IBM Plex Sans', sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(String(row.ligand), cx, plotY + plotH + 18);
		ctx.textAlign = "left";
	});
	if (multi) {
		let lx = x + pad;
		const legendY = y + h - 18;
		ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.textBaseline = "middle";
		for (const engine of chart.engines) {
			ctx.fillStyle = engineColor(engine, chart.engines);
			roundRect(ctx, lx, legendY - 5, 10, 10, 2);
			ctx.fill();
			ctx.fillStyle = MUTED$1;
			ctx.fillText(engine, lx + 14, legendY);
			lx += ctx.measureText(engine).width + 28;
		}
		ctx.textBaseline = "alphabetic";
	}
}
function paintFingerprint(ctx, fp, poseLabels, x, y, w, h, opts) {
	const titled = Boolean(opts?.title);
	const layout = fingerprintPlateLayout(fp.residues.length, fp.poseIds.length, w, { titled });
	ctx.fillStyle = SURFACE;
	roundRect(ctx, x, y, w, Math.max(h, layout.height), 12);
	ctx.fill();
	ctx.strokeStyle = BORDER;
	ctx.lineWidth = 1;
	roundRect(ctx, x, y, w, Math.max(h, layout.height), 12);
	ctx.stroke();
	const { pad, titleH, headerH, rowH, bandH, bandGap, labelW, cell, gap } = layout;
	const bands = bandResidues(fp.residues, layout.perBand);
	let y0 = y + pad;
	if (opts?.title) {
		ctx.fillStyle = FAINT;
		ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
		ctx.fillText(opts.title.toUpperCase(), x + pad, y0 + 14);
		if (opts.subtitle) {
			ctx.fillStyle = MUTED$1;
			ctx.font = "13px 'IBM Plex Sans', sans-serif";
			ctx.fillText(opts.subtitle, x + pad, y0 + 36);
		}
		y0 += titleH;
	}
	bands.forEach((residues, b) => {
		const top = y0 + b * (bandH + bandGap);
		ctx.fillStyle = FAINT;
		ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		if (b === 0) ctx.fillText("Pose", x + pad, top + headerH - 16);
		residues.forEach((res, i) => {
			const cx = x + pad + labelW + i * (cell + gap) + cell / 2;
			ctx.save();
			ctx.translate(cx, top + headerH - 10);
			ctx.rotate(-Math.PI / 2);
			ctx.fillStyle = MUTED$1;
			ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText(res, 0, 0);
			ctx.restore();
		});
		fp.poseIds.forEach((id, r) => {
			const ry = top + headerH + r * rowH;
			ctx.fillStyle = FG;
			ctx.font = "13px 'IBM Plex Sans', sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			ctx.fillText(poseLabels[id] ?? id, x + pad, ry + cell / 2);
			residues.forEach((res, i) => {
				const types = fp.cells.get(cellKey(id, res)) ?? [];
				const lead = types[0];
				const cx = x + pad + labelW + i * (cell + gap);
				ctx.fillStyle = lead ? FINGERPRINT_COLORS[lead] : "#1a1a1e";
				roundRect(ctx, cx, ry, cell, cell, 4);
				ctx.fill();
				if (types.includes("hbond") || types.includes("salt")) {
					ctx.strokeStyle = "rgba(244,241,234,0.4)";
					ctx.lineWidth = 1.25;
					roundRect(ctx, cx + .5, ry + .5, cell - 1, cell - 1, 4);
					ctx.stroke();
				}
			});
		});
	});
	const legendY = y + Math.max(h, layout.height) - pad - 10;
	const keys = [
		["hbond", "H-bond"],
		["salt", "Salt"],
		["hydrophobic", "Hydrophobic"],
		["pi-stack", "π-stack"],
		["contact", "Contact"]
	];
	let lx = x + pad;
	ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.textBaseline = "middle";
	ctx.textAlign = "left";
	for (const [type, lab] of keys) {
		ctx.fillStyle = FINGERPRINT_COLORS[type];
		roundRect(ctx, lx, legendY - 5, 10, 10, 2);
		ctx.fill();
		ctx.fillStyle = MUTED$1;
		ctx.fillText(lab, lx + 14, legendY);
		lx += ctx.measureText(lab).width + 28;
	}
	ctx.textBaseline = "alphabetic";
}
async function renderFingerprintPng(fp, poseLabels, opts) {
	const layout = fingerprintPlateLayout(fp.residues.length, fp.poseIds.length, opts?.width ?? 2200, { titled: true });
	const scale = 2;
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(layout.width * scale);
	canvas.height = Math.round(layout.height * scale);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not allocate fingerprint canvas");
	try {
		await document.fonts.ready;
	} catch {}
	ctx.scale(scale, scale);
	ctx.fillStyle = BG;
	ctx.fillRect(0, 0, layout.width, layout.height);
	paintFingerprint(ctx, fp, poseLabels, 0, 0, layout.width, layout.height, {
		title: opts?.title ?? "Interaction fingerprint",
		subtitle: opts?.subtitle ?? `${fp.residues.length} pocket residues · ${fp.poseIds.length} poses · sequence order`
	});
	return canvas.toDataURL("image/png");
}
function drawContain(ctx, img, x, y, w, h) {
	const scale = Math.min(w / img.width, h / img.height);
	const dw = img.width * scale;
	const dh = img.height * scale;
	const dx = x + (w - dw) / 2;
	const dy = y + (h - dh) / 2;
	ctx.drawImage(img, dx, dy, dw, dh);
}
function paintResidueTable(ctx, rows, x, y, w, h) {
	ctx.fillStyle = SURFACE;
	roundRect(ctx, x, y, w, h, 12);
	ctx.fill();
	const pad = 18;
	ctx.fillStyle = FAINT;
	ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.fillText("INTERACTING RESIDUES", x + pad, y + 26);
	const headers = [
		"Residue",
		"Type",
		"Atoms",
		"Å"
	];
	const cols = [
		.28,
		.4,
		.22,
		.1
	];
	let hx = x + pad;
	ctx.fillStyle = MUTED$1;
	ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
	headers.forEach((lab, i) => {
		const cw = (w - 36) * cols[i];
		ctx.textAlign = i === headers.length - 1 ? "right" : "left";
		ctx.fillText(lab, i === headers.length - 1 ? hx + cw : hx, y + 48);
		hx += cw;
	});
	ctx.textAlign = "left";
	const rowH = 22;
	const start = y + 58;
	const max = Math.max(0, Math.floor((h - 70) / rowH));
	rows.slice(0, max).forEach((row, i) => {
		const yy = start + i * rowH;
		ctx.fillStyle = i % 2 ? "rgba(27,26,24,0.04)" : "transparent";
		ctx.fillRect(x + pad, yy - 14, w - 36, rowH);
		let cx = x + pad;
		const cells = [
			prettyResidue(row.resName, row.resSeq, row.chain),
			row.types.map((t) => INTERACTION_LABEL[t]).join(" · "),
			`${row.ligandAtom}··${row.residueAtom}`,
			row.distance.toFixed(2)
		];
		ctx.font = "13px 'IBM Plex Sans', sans-serif";
		cells.forEach((text, ci) => {
			const cw = (w - 36) * cols[ci];
			ctx.fillStyle = ci === 0 ? FG : MUTED$1;
			ctx.textAlign = ci === 3 ? "right" : "left";
			ctx.fillText(text, ci === 3 ? cx + cw : cx, yy);
			cx += cw;
		});
		ctx.textAlign = "left";
	});
	if (rows.length > max) {
		ctx.fillStyle = FAINT;
		ctx.font = "11px 'IBM Plex Sans', sans-serif";
		ctx.fillText(`+ ${rows.length - max} more`, x + pad, y + h - 14);
	}
}
function paintCommonContacts(ctx, rows, poseCount, x, y, w, h) {
	ctx.fillStyle = SURFACE;
	roundRect(ctx, x, y, w, h, 12);
	ctx.fill();
	const pad = 18;
	ctx.fillStyle = FAINT;
	ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.fillText(`COMMON CONTACTS  ·  ${poseCount} poses`, x + pad, y + 26);
	if (!rows.length) {
		ctx.fillStyle = MUTED$1;
		ctx.font = "13px 'IBM Plex Sans', sans-serif";
		ctx.fillText("No residue is shared by every overlay pose.", x + pad, y + 56);
		return;
	}
	const rowH = 22;
	const start = y + 48;
	const max = Math.max(0, Math.floor((h - 62) / rowH));
	rows.slice(0, max).forEach((row, i) => {
		const yy = start + i * rowH;
		ctx.fillStyle = FG;
		ctx.font = "13px 'IBM Plex Sans', sans-serif";
		ctx.fillText(prettyResidue(row.resName, row.resSeq, row.chain), x + pad, yy);
		ctx.fillStyle = MUTED$1;
		ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.fillText(row.types.map((t) => INTERACTION_LABEL[t]).join(" · "), x + pad + 120, yy);
		ctx.textAlign = "right";
		ctx.fillText(`${row.nPoses}/${poseCount}  ${row.meanDist.toFixed(2)} Å`, x + w - pad, yy);
		ctx.textAlign = "left";
	});
}
function exportPanelHeight(panel, span, colW, gutter, fingerprint, scale) {
	const cap = 66;
	if (panel.height != null) return Math.round(panel.height * scale) + cap;
	if (panel.kind === "ss") return 210;
	if (panel.kind === "chart") return 320;
	if (panel.kind === "residues") return 360;
	if (panel.kind === "contacts") return 240;
	if (panel.kind === "sketch") return 340;
	if (panel.kind === "fingerprint") {
		const nPoses = Math.max(fingerprint?.poseIds.length ?? 3, 1);
		return fingerprintPlateLayout(Math.max(fingerprint?.residues.length ?? 12, 1), nPoses, colW * span + gutter * (span - 1), { titled: true }).height + cap;
	}
	const w = colW * span + gutter * (span - 1);
	return Math.round(w * .62) + 56;
}
function panelBoxHeight(panel, span, colW, gutter, fingerprint, scale, rowH) {
	const own = exportPanelHeight(panel, span, colW, gutter, fingerprint, scale);
	return Math.max(80, Math.min(own, rowH) - 44 - 22);
}
async function composeScenePng(opts) {
	const { title, subtitle, panels, ss, chart, fingerprint, poseLabels, ligandColors, chartStyle, interacting, residueRows = [], commonRows = [], poseCount = 0 } = opts;
	const packed = packScene(panels, 12);
	const pageW = 1800;
	const margin = 56;
	const gutter = 18;
	const innerW = 1688;
	const colW = 1490 / 12;
	const titleH = subtitle ? 92 : 72;
	const scale = innerW / PLATE_CSS_W;
	const rowHeights = [];
	for (let r = 0; r < packed.rows; r++) {
		const rowPanels = packed.cells.filter((c) => c.row === r);
		let h = 160;
		for (const cell of rowPanels) {
			const panel = panels.find((p) => p.id === cell.id);
			if (!panel) continue;
			h = Math.max(h, exportPanelHeight(panel, cell.span, colW, gutter, fingerprint, scale));
		}
		rowHeights[r] = h;
	}
	const bodyH = rowHeights.reduce((a, b) => a + b, 0) + gutter * Math.max(0, packed.rows - 1);
	const pageH = Math.max(1100, margin + titleH + bodyH + margin);
	const canvas = document.createElement("canvas");
	canvas.width = pageW;
	canvas.height = pageH;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not allocate a figure canvas");
	ctx.fillStyle = BG;
	ctx.fillRect(0, 0, pageW, pageH);
	try {
		await document.fonts.ready;
	} catch {}
	ctx.fillStyle = FG;
	ctx.font = "italic 44px 'Instrument Serif', Georgia, serif";
	ctx.fillText(title || "PoseAtlas figure", margin, 96);
	if (subtitle) {
		ctx.fillStyle = MUTED$1;
		ctx.font = "16px 'IBM Plex Sans', sans-serif";
		ctx.fillText(subtitle, margin, 124);
	}
	const images = /* @__PURE__ */ new Map();
	await Promise.all(panels.filter((p) => p.src).map(async (p) => {
		try {
			images.set(p.id, await loadImage(p.src));
		} catch {}
	}));
	let yCursor = margin + titleH;
	for (let r = 0; r < packed.rows; r++) {
		const rowH = rowHeights[r];
		const rowCells = packed.cells.filter((c) => c.row === r);
		for (const cell of rowCells) {
			const panel = panels.find((p) => p.id === cell.id);
			if (!panel) continue;
			const x = margin + cell.col * 142.16666666666669;
			const w = colW * cell.span + gutter * (cell.span - 1);
			const boxH = panelBoxHeight(panel, cell.span, colW, gutter, fingerprint, scale, rowH);
			const letter = String.fromCharCode(65 + panels.findIndex((p) => p.id === panel.id));
			ctx.fillStyle = FAINT;
			ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
			ctx.fillText(`${letter}  ${panel.title.toUpperCase()}`, x, yCursor + 14);
			const boxY = yCursor + 22;
			if (panel.kind === "ss" && ss) paintSsReport(ctx, ss, x, boxY, w, boxH, interacting);
			else if (panel.kind === "chart" && chart) paintAffinityChart(ctx, chart, x, boxY, w, boxH, ligandColors, chartStyle);
			else if (panel.kind === "fingerprint" && fingerprint) paintFingerprint(ctx, fingerprint, poseLabels, x, boxY, w, boxH, {
				title: "Interaction fingerprint",
				subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`
			});
			else if (panel.kind === "residues") paintResidueTable(ctx, residueRows, x, boxY, w, boxH);
			else if (panel.kind === "contacts") paintCommonContacts(ctx, commonRows, poseCount, x, boxY, w, boxH);
			else if (images.has(panel.id)) {
				ctx.fillStyle = SURFACE;
				roundRect(ctx, x, boxY, w, boxH, 12);
				ctx.fill();
				ctx.save();
				roundRect(ctx, x, boxY, w, boxH, 12);
				ctx.clip();
				if (panel.kind === "snapshot" || panel.kind === "sketch") drawContain(ctx, images.get(panel.id), x, boxY, w, boxH);
				else drawCover(ctx, images.get(panel.id), x, boxY, w, boxH);
				ctx.restore();
			} else {
				ctx.fillStyle = SURFACE;
				roundRect(ctx, x, boxY, w, boxH, 12);
				ctx.fill();
				ctx.fillStyle = FAINT;
				ctx.font = "14px 'IBM Plex Sans', sans-serif";
				ctx.fillText("Empty panel", x + 18, boxY + boxH / 2);
			}
			if (panel.caption) {
				ctx.fillStyle = MUTED$1;
				ctx.font = "13px 'IBM Plex Sans', sans-serif";
				const cap = panel.caption.length > 110 ? `${panel.caption.slice(0, 107)}…` : panel.caption;
				ctx.fillText(cap, x, yCursor + rowH - 8);
			}
		}
		yCursor += rowH + gutter;
	}
	return canvas.toDataURL("image/png");
}
var TYPE_CLASS = {
	hbond: "bg-int-hbond",
	salt: "bg-int-salt",
	hydrophobic: "bg-int-hydrophobic",
	"pi-stack": "bg-int-pi",
	"pi-cation": "bg-int-pi",
	contact: "bg-raised"
};
function FingerprintGrid({ fingerprint, names, labels, compact = false, figure = false }) {
	const addPanel = useScene((s) => s.addPanel);
	const updatePanel = useScene((s) => s.updatePanel);
	const setOpen = useScene((s) => s.setOpen);
	const setSelected = useScene((s) => s.setSelected);
	const panels = useScene((s) => s.panels);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (fingerprint.poseIds.length < 2 || fingerprint.residues.length === 0) return null;
	function poseName(id) {
		return ligandDisplay(names, id, labels[id] ?? id);
	}
	async function snapshotPlate() {
		setBusy(true);
		setError(null);
		try {
			const poseLabels = {};
			for (const id of fingerprint.poseIds) poseLabels[id] = poseName(id);
			const src = await renderFingerprintPng(fingerprint, poseLabels, {
				title: "Interaction fingerprint",
				subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`
			});
			const caption = `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses. Teal is polar; grey is hydrophobic.`;
			const existing = panels.find((p) => p.kind === "fingerprint");
			if (existing) {
				updatePanel(existing.id, {
					src,
					caption
				});
				setSelected(existing.id);
				setOpen(true);
			} else {
				const id = addPanel({
					kind: "fingerprint",
					title: "Interaction fingerprint",
					caption,
					src,
					span: 12
				}, { open: true });
				setSelected(id);
			}
			try {
				await downloadDataUrl(src, `poseatlas-fingerprint-${fingerprint.residues.length}res.png`);
			} catch {}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not render the fingerprint plate");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: figure ? "fingerprint-figure" : void 0,
		className: cn(compact ? "px-2 py-2" : "figure-fp mx-2 mb-2 rounded-2xl border border-border px-3 py-3"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: "Interaction fingerprint"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							fingerprint.residues.length,
							" pocket residues · ",
							fingerprint.poseIds.length,
							" poses. Sequence order. Snapshot is the publication plate."
						]
					})]
				}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => void snapshotPlate(),
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), busy ? "Saving" : "Snapshot"]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintMatrix, {
				fingerprint,
				poseLabel: poseName,
				compact
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted",
				children: Object.entries(INTERACTION_LABEL).map(([k, lab]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-sm", TYPE_CLASS[k]) }), lab]
				}, k))
			})
		]
	});
}
function FingerprintMatrix({ fingerprint, poseLabel, compact = false }) {
	const ref = (0, import_react.useRef)(null);
	const [perBand, setPerBand] = (0, import_react.useState)(12);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const fit = () => {
			const w = el.clientWidth || 320;
			setPerBand(fingerprintFit(fingerprint.residues.length, fingerprint.poseIds.length, w).perBand);
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(el);
		return () => ro.disconnect();
	}, [fingerprint.residues.length, fingerprint.poseIds.length]);
	const bands = bandResidues(fingerprint.residues, perBand);
	const cell = compact ? "size-3" : "size-3.5";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "mt-2 space-y-3 overflow-x-hidden",
		children: bands.map((residues, band) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full table-fixed border-separate border-spacing-0.5 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "w-16 bg-surface px-1 py-1 font-mono text-xs font-medium text-faint",
				children: band === 0 ? "Pose" : ""
			}), residues.map((res) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "px-0 py-1 text-center font-mono text-xs font-medium text-faint [writing-mode:vertical-rl] rotate-180",
				children: res
			}, res))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: fingerprint.poseIds.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "truncate bg-surface px-1 py-0.5 text-left text-xs font-medium text-fg",
				children: poseLabel(id)
			}), residues.map((res) => {
				const types = fingerprint.cells.get(cellKey(id, res)) ?? [];
				const polar = types.includes("hbond") || types.includes("salt");
				const lead = types[0];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: types.length ? `${res} · ${types.join(", ")}` : `${res} · none`,
						className: cn("mx-auto block rounded-sm", cell, lead ? TYPE_CLASS[lead] : "bg-raised", polar && "ring-1 ring-fg/30")
					})
				}, res);
			})] }, `${id}-${band}`)) })]
		}, `band-${band}-${residues[0] ?? band}`))
	});
}
var Input = import_react.forwardRef(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn("h-8 w-full min-w-0 rounded-md border border-border bg-raised px-2.5 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent/40", className),
		...props
	});
});
function InventoryPanel({ receptor, poses }) {
	const names = useSession((s) => s.names);
	const setProteinName = useSession((s) => s.setProteinName);
	const setChainName = useSession((s) => s.setChainName);
	const setLigandName = useSession((s) => s.setLigandName);
	const setHetName = useSession((s) => s.setHetName);
	const setEngine = useSession((s) => s.setEngine);
	const setAffinity = useSession((s) => s.setAffinity);
	const removePose = useSession((s) => s.removePose);
	const visibleIds = useSession((s) => s.visibleIds);
	const focusedId = useSession((s) => s.focusedId);
	const toggleVisible = useSession((s) => s.toggleVisible);
	const solo = useSession((s) => s.solo);
	const proteinFallback = useSession((s) => s.proteinFallback);
	const inv = receptor?.inventory ?? poses[0]?.inventory ?? null;
	const engines = [...new Set(poses.map((p) => p.engine.trim() || "Unknown"))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: "Protein"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: names.protein,
						placeholder: proteinFallback,
						onChange: (e) => setProteinName(e.target.value),
						"aria-label": "Protein name",
						className: "mt-2"
					}),
					inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: [
							inv.residueCount,
							" residues · ",
							inv.chains.length,
							" chain",
							inv.chains.length === 1 ? "" : "s",
							" ·",
							" ",
							inv.proteinAtomCount,
							" atoms"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Load a PDB to inventory chains and HETATMs."
					})
				]
			}),
			inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "Chains / domains"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: inv.chains.filter((chain) => chain.proteinResidues.length > 0).map((chain) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg border border-border bg-raised/40 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-faint",
								children: chain.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs tabular-nums text-muted",
								children: [chain.proteinResidues.length, " aa"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: names.chains[chain.id] ?? "",
							placeholder: chainDisplay(names, chain.id),
							onChange: (e) => setChainName(chain.id, e.target.value),
							"aria-label": `Name for chain ${chain.id}`,
							className: "mt-1.5 h-8"
						})]
					}, chain.id))
				})]
			}) : null,
			inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "HETATM groups"
				}), inv.ligands.length === 0 && inv.waters.length === 0 && inv.ions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "No hetero groups in the receptor file."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-2",
					children: [
						inv.ligands.map((lig) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-raised/40 p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2 font-mono text-xs text-faint",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									lig.resName,
									" ",
									lig.chain,
									lig.resSeq
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									lig.formula,
									" · ",
									lig.atomCount,
									" at"
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: names.hetatms[lig.key] ?? "",
								placeholder: hetDisplay(names, lig.key, lig.resName),
								onChange: (e) => setHetName(lig.key, e.target.value),
								"aria-label": `Name for ${lig.resName}`,
								className: "mt-1.5"
							})]
						}, lig.key)),
						inv.waters.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "font-mono text-xs text-muted",
							children: [
								"Waters · ",
								inv.waters.length,
								" HOH"
							]
						}) : null,
						inv.ions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "font-mono text-xs text-muted",
							children: ["Ions · ", inv.ions.map((i) => i.resName).join(", ")]
						}) : null
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 font-mono text-xs tracking-widest text-faint uppercase",
						children: "Poses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 px-1 text-xs text-muted",
						children: "Same ligand from another engine? Use Add engine — names match automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: "poseatlas-engines",
						children: ENGINE_OPTIONS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id }, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: poses.map((pose) => {
							const on = visibleIds.includes(pose.id);
							const focused = focusedId === pose.id;
							const engineName = pose.engine.trim() || "Unknown";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("rounded-lg border px-2 py-2", on ? "border-border bg-raised" : "border-transparent bg-raised/30"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => toggleVisible(pose.id),
												className: "flex min-w-0 flex-1 items-center gap-2 text-left",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("size-2.5 shrink-0 rounded-full", on ? "opacity-100" : "opacity-30"),
														style: { background: pose.color }
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "min-w-0 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "block truncate text-sm font-medium",
															children: ligandDisplay(names, pose.id, pose.fallbackLabel)
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "block truncate font-mono text-xs text-faint",
															children: [
																engineName,
																" · ",
																pose.filename
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono text-xs tabular-nums text-fg",
														children: [formatAffinity(pose.affinity), pose.affinity !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-faint",
															children: " kcal"
														}) : null]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => solo(pose.id),
												className: cn("hidden rounded-md px-2 py-1 font-mono text-xs tracking-wide uppercase sm:inline", focused && on && visibleIds.length === 1 ? "text-fg" : "text-faint hover:text-fg"),
												children: "Solo"
											}),
											poses.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => removePose(pose.id),
												className: "rounded-md p-1 text-faint hover:text-fg",
												"aria-label": `Remove ${pose.filename}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: names.ligands[pose.id] ?? "",
										placeholder: pose.fallbackLabel,
										onChange: (e) => setLigandName(pose.id, e.target.value),
										"aria-label": `Ligand name for ${pose.filename}`,
										className: "mt-1.5"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1.5 grid grid-cols-2 gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "sr-only",
												children: ["Engine for ", pose.fallbackLabel]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												list: "poseatlas-engines",
												value: pose.engine,
												placeholder: "Engine",
												onChange: (e) => setEngine(pose.id, e.target.value),
												"aria-label": `Docking engine for ${pose.filename}`,
												style: engines.length > 1 ? { boxShadow: `inset 3px 0 0 ${engineColor(engineName, engines)}` } : void 0
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "sr-only",
												children: ["Affinity for ", pose.fallbackLabel]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												step: "0.01",
												value: pose.affinity ?? "",
												placeholder: "kcal/mol",
												onChange: (e) => {
													const raw = e.target.value;
													if (raw === "" || raw === "-") {
														setAffinity(pose.id, null);
														return;
													}
													const n = Number.parseFloat(raw);
													setAffinity(pose.id, Number.isFinite(n) ? n : null);
												},
												"aria-label": `Affinity for ${pose.filename}`
											})]
										})]
									})
								]
							}, pose.id);
						})
					})
				]
			})
		]
	});
}
function LoadBar({ onMethods }) {
	const inputRef = (0, import_react.useRef)(null);
	const addRef = (0, import_react.useRef)(null);
	const [libraryOpen, setLibraryOpen] = (0, import_react.useState)(false);
	const loadFiles = useSession((s) => s.loadFiles);
	const addFiles = useSession((s) => s.addFiles);
	const loadLibraryTarget = useSession((s) => s.loadLibraryTarget);
	const libraryTargetId = useSession((s) => s.libraryTargetId);
	const kind = useSession((s) => s.kind);
	const poseCount = useSession((s) => s.poses.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative z-20 flex items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-baseline gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl tracking-tight sm:text-2xl",
					children: "PoseAtlas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden truncate text-xs text-muted sm:block",
					children: "Pose view for docking results · white figures for publication"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						id: "load-pdb-files",
						type: "file",
						accept: ".pdb,.ent,.txt,.PDB",
						multiple: true,
						className: "sr-only",
						tabIndex: -1,
						onChange: (event) => {
							const list = event.target.files;
							if (list?.length) loadFiles([...list]);
							event.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: addRef,
						id: "add-engine-files",
						type: "file",
						accept: ".pdb,.ent,.txt,.PDB",
						multiple: true,
						className: "sr-only",
						tabIndex: -1,
						onChange: (event) => {
							const list = event.target.files;
							if (list?.length) addFiles([...list]);
							event.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => inputRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Load PDBs"]
					}),
					poseCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addRef.current?.click(),
						"aria-label": "Add docking poses from another engine",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Add engine"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden",
								children: "Add"
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: kind === "library" ? "secondary" : "ghost",
						onClick: () => setLibraryOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Library"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: onMethods,
						"aria-label": "Methods",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Methods"
						})]
					})
				]
			}),
			libraryOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 sm:items-center",
				onClick: () => setLibraryOpen(false),
				role: "presentation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-labelledby": "library-title",
					className: "relative z-[81] max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "library-title",
							className: "font-display text-2xl",
							children: "Demo library"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Six Klebsiella pneumoniae receptors, each with a co-crystallized ligand plus OX-11 and T2Z14. Names can be edited after loading."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-1",
							children: TARGETS.map((target) => {
								const active = libraryTargetId === target.id;
								const win = winnerOf(target);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										loadLibraryTarget(target.id);
										setLibraryOpen(false);
									},
									className: cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150", active ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block font-mono text-xs tracking-wide text-faint",
											children: [
												target.pdbId,
												" · ",
												target.gene
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium",
											children: target.protein
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2 shrink-0 rounded-full",
										style: { background: win ? POSE_COLOR[win] : "var(--color-faint)" }
									})]
								}) }, target.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setLibraryOpen(false),
								children: "Close"
							})
						})
					]
				})
			}) : null
		]
	});
}
function MethodsDialog({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 sm:items-center",
		onClick: onClose,
		onKeyDown: (event) => {
			if (event.key === "Escape") onClose();
		},
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-labelledby": "methods-title",
			className: "relative z-[81] max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "methods-title",
					className: "font-display text-2xl",
					children: "How PoseAtlas reads a pose"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3 text-sm leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Load any protein–ligand PDB — a GNINA complex, a crystal structure, or a pose from another engine. PoseAtlas inventories chains, residues, and HETATM groups, then names you assign to the protein, domains, and ligands appear on every panel and in the figure caption." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Secondary structure is assigned with a Kabsch–Sander DSSP: backbone N–H···O=C hydrogen-bond energies (E = 0.42·0.20·332·(1/r",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: "ON" }),
							"+1/r",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: "CH" }),
							"−1/r",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: "OH" }),
							"−1/r",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: "CN" }),
							")) below −0.5 kcal/mol define 3₁₀, α and π helices, β bridges, and turns. φ/ψ dihedrals feed the Ramachandran plot."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Contacts follow a PLIP-style scheme: polar pairs ≤ 3.5 Å (H-bonds), charged pairs (salt bridges), carbon–carbon contacts in hydrophobic side chains, aromatic ring centroids (π-stacking / π-cation). The 3D scene shows side chains and polar dashes; hydrophobic contacts stay on the 2D map and fingerprint." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The 2D drawings are cheminformatics, not a 3D snapshot. Heavy-atom bonds come from covalent radii; explicit hydrogens on the pose set valences so 1,3,4-oxadiazoles do not sprout an extra NH. OpenChemLib (Actelion) kekulizes, writes SMILES and the Hill formula, and invents ChemDraw-style coordinates. The contact map is that same 2D structure rotated onto the docked pose (Kabsch) so residue dashes keep their 3D direction. Flat tiles use the OpenChemLib SVG depiction." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pocket surfaces are solvent-accessible shells within 7.5 Å of the ligand. Electrostatics use a Coulombic sum over formal charges at pH 7 — a qualitative map, not APBS. Hydrophobic colouring is Kyte–Doolittle hydropathy." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Affinities are read from REMARK lines (GNINA CNN, Vina RESULT, AutoDock ΔG, GlideScore, GOLD). You can type a score or engine name on any pose. Add engine uploads the same protein–ligand complex from another program; matching ligand names (OX-11 / OX11) are grouped automatically. Overlay draws the poses together. The affinity chart is grouped or overlapped by ligand × engine — Y-axis and table are labelled in kcal/mol. Copy exports a table with units; SVG downloads a white paper figure." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pose view is the engine for inspecting results: 3D, 2D map, and a tabulated residue list. Figures is the publication plate on white paper. To scene captures the 3D camera you framed (zoom and orientation are kept) and drops it on the plate; Download writes the same PNG. Add 2D, DSSP, affinity, common contacts (residues shared by every overlay pose), the residue table, or the fingerprint as separate panels — molecular views in one set, exhaustive tables in another. Export PNG is white paper. Drag edges to resize." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The demo library is six Klebsiella pneumoniae receptors with native ligands plus OX-11 and T2Z14. Library affinities are GNINA CNN scores in kcal/mol at pH 7.4." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-faint",
							children: "Keys: 1–3 poses · [ ] library targets · O overlay · S spin · L labels · C chart"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClose,
						children: "Close"
					})
				})
			]
		})
	});
}
function ResidueTable({ hits, ssByKey, ligandName, compact = false }) {
	const rows = tabulateResidues(hits);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex items-baseline justify-between gap-2 px-3", compact ? "pt-2" : "px-4 pt-3"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "Interacting residues"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: rows.length
				})]
			}),
			compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-4 pt-1 text-xs text-muted",
				children: [ligandName || "Ligand", " contacts, one row per residue. Polar pairs ≤ 3.5 Å."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("min-h-0 flex-1 overflow-auto", compact ? "px-2 py-1.5" : "px-3 py-2"),
				children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-1 py-3 text-sm text-muted",
					children: "No heavy-atom contacts within cutoff."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[18rem] border-collapse text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-xs text-faint",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-2 font-medium",
								children: "Residue"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-2 font-medium",
								children: "SS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "hidden py-1 pr-2 font-medium sm:table-cell",
								children: "Class"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-2 font-medium",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "hidden py-1 pr-2 font-medium md:table-cell",
								children: "Atoms"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 text-right font-medium",
								children: "Å"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
						const key = `${row.chain}:${row.resSeq}`;
						const ss = ssByKey[key] ?? "C";
						const group = ssGroup(ss);
						const cls = aaClass(row.resName);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 pr-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: prettyResidue(row.resName, row.resSeq, row.chain)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-1.5 pr-2 font-mono text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mr-1 inline-block size-1.5 rounded-full", group === "helix" && "bg-ss-helix", group === "sheet" && "bg-ss-sheet", group === "turn" && "bg-ss-turn", group === "coil" && "bg-ss-coil") }), compact ? ss : ssLabel(ss)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "hidden py-1.5 pr-2 font-mono text-xs text-muted sm:table-cell",
									children: aaClassLabel(cls)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 pr-2 font-mono text-xs text-muted",
									children: row.types.map((t) => INTERACTION_LABEL[t]).join(" · ")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "hidden py-1.5 pr-2 font-mono text-xs text-faint md:table-cell",
									children: [
										row.ligandAtom,
										"··",
										row.residueAtom
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5 text-right font-mono text-xs tabular-nums text-fg",
									children: row.distance.toFixed(2)
								})
							]
						}, key);
					}) })]
				})
			})
		]
	});
}
function ContactsTable({ rows, poseCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "Common contacts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: [
						rows.length,
						" / ",
						poseCount,
						" poses"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: "Residues shared by every overlay pose."
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-3 text-sm text-muted",
				children: "Overlay two or more poses to list shared residues."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-2 w-full border-collapse text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "font-mono text-xs text-faint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-2 font-medium",
							children: "Residue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-2 font-medium",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-2 font-medium",
							children: "Poses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 text-right font-medium",
							children: "Å"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 pr-2 text-sm font-medium",
							children: prettyResidue(row.resName, row.resSeq, row.chain)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 pr-2 font-mono text-xs text-muted",
							children: row.types.map((t) => INTERACTION_LABEL[t]).join(" · ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-1.5 pr-2 font-mono text-xs tabular-nums text-muted",
							children: [
								row.nPoses,
								"/",
								poseCount
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 text-right font-mono text-xs tabular-nums",
							children: row.meanDist.toFixed(2)
						})
					]
				}, `${row.chain}:${row.resSeq}`)) })]
			})
		]
	});
}
/** Rasterise the 2D publication plate (#figure-2d) onto white paper. */
var PAPER = "#faf9f6";
var INK = "#1b1a18";
var MUTED = "#5c5a54";
var VAR_MAP = [
	["var(--color-bg)", PAPER],
	["var(--color-surface)", "#ffffff"],
	["var(--color-raised)", "#efeae2"],
	["var(--color-fg)", INK],
	["var(--color-muted)", MUTED],
	["var(--color-faint)", "#8a8780"],
	["var(--color-border)", "#d8d2c6"],
	["var(--color-accent)", INK],
	["var(--color-int-hbond)", "#0f7a6c"],
	["var(--color-int-salt)", "#b44545"],
	["var(--color-int-hydrophobic)", "#7a756c"],
	["var(--color-int-pi)", "#c46b5a"]
];
function bakeSvg(svg) {
	const clone = svg.cloneNode(true);
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	if (!clone.getAttribute("viewBox") && svg.viewBox?.baseVal) {
		const vb = svg.viewBox.baseVal;
		clone.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
	}
	let html = clone.outerHTML;
	for (const [from, to] of VAR_MAP) html = html.split(from).join(to);
	return html;
}
function svgToImage(markup) {
	return new Promise((resolve, reject) => {
		const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not rasterise 2D SVG"));
		};
		img.src = url;
	});
}
async function snapshotFigure2d() {
	if (typeof document === "undefined") return null;
	const root = document.getElementById("figure-2d");
	if (!root) return null;
	const svgs = [...root.querySelectorAll("svg")];
	if (!svgs.length) return null;
	const title = root.querySelector("header p")?.textContent?.trim() || "Pose 2D";
	const formula = root.querySelector("header .tabular-nums")?.textContent?.trim() ?? "";
	const smiles = root.querySelector("[data-smiles]")?.textContent?.trim() ?? "";
	const images = await Promise.all(svgs.slice(0, 2).map((svg) => svgToImage(bakeSvg(svg))));
	const map = images[0];
	const skeletal = images[1] ?? null;
	const w = 1100;
	const mapH = 520;
	const smilesH = smiles ? 72 : 0;
	const skelH = skeletal ? 240 : 0;
	const h = 592 + smilesH + (skelH ? skelH + 16 : 0) + 24;
	const canvas = document.createElement("canvas");
	canvas.width = w * 2;
	canvas.height = h * 2;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	ctx.scale(2, 2);
	ctx.fillStyle = PAPER;
	ctx.fillRect(0, 0, w, h);
	ctx.fillStyle = INK;
	ctx.font = "italic 22px 'Instrument Serif', Georgia, serif";
	ctx.fillText(title, 28, 36);
	if (formula) {
		ctx.fillStyle = MUTED;
		ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.textAlign = "right";
		ctx.fillText(formula, 1072, 36);
		ctx.textAlign = "left";
	}
	const mapW = 1044;
	ctx.drawImage(map, 28, 48, mapW, mapH);
	let y = 584;
	if (smiles) {
		ctx.fillStyle = MUTED;
		ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
		ctx.fillText("SMILES", 28, y + 14);
		ctx.fillStyle = INK;
		ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
		wrapText(ctx, smiles, 28, y + 34, 1044, 16);
		y += smilesH;
	}
	if (skeletal) ctx.drawImage(skeletal, 28, y, mapW, skelH);
	return canvas.toDataURL("image/png");
}
function wrapText(ctx, text, x, y, maxW, lineH) {
	const chars = text.split("");
	let line = "";
	let yy = y;
	for (const ch of chars) {
		const next = line + ch;
		if (ctx.measureText(next).width > maxW && line) {
			ctx.fillText(line, x, yy);
			line = ch;
			yy += lineH;
		} else line = next;
	}
	if (line) ctx.fillText(line, x, yy);
}
function SceneBoard({ ss, poses, names, interacting, proteinName, ligandName, fingerprint, hits, hitsByPose, ssByKey }) {
	const open = useScene((s) => s.open);
	const setOpen = useScene((s) => s.setOpen);
	const title = useScene((s) => s.title);
	const subtitle = useScene((s) => s.subtitle);
	const setTitle = useScene((s) => s.setTitle);
	const setSubtitle = useScene((s) => s.setSubtitle);
	const panels = useScene((s) => s.panels);
	const selectedId = useScene((s) => s.selectedId);
	const setSelected = useScene((s) => s.setSelected);
	const addPanel = useScene((s) => s.addPanel);
	const updatePanel = useScene((s) => s.updatePanel);
	const removePanel = useScene((s) => s.removePanel);
	const movePanel = useScene((s) => s.movePanel);
	const ensureScaffold = useScene((s) => s.ensureScaffold);
	const migrateLayout = useScene((s) => s.migrateLayout);
	const clear = useScene((s) => s.clear);
	const chartStyle = useSession((s) => s.chartStyle);
	const photoRef = (0, import_react.useRef)(null);
	const plateRef = (0, import_react.useRef)(null);
	const dragId = (0, import_react.useRef)(null);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const inspectorW = useChrome((s) => s.inspectorW);
	const setInspectorW = useChrome((s) => s.setInspectorW);
	const resetInspector = useChrome((s) => s.resetInspector);
	const hydrateChrome = useChrome((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrateChrome();
	}, [hydrateChrome]);
	(0, import_react.useEffect)(() => {
		if (open) migrateLayout();
	}, [open, migrateLayout]);
	if (!open) return null;
	function addOnce(kind, title, caption, span) {
		const existing = panels.find((p) => p.kind === kind);
		if (existing) {
			setSelected(existing.id);
			return;
		}
		addPanel({
			kind,
			title,
			caption,
			span: span ?? defaultPanelSpan(kind)
		}, { open: true });
	}
	const selected = panels.find((p) => p.id === selectedId) ?? null;
	const displayTitle = title || proteinName;
	const displaySubtitle = subtitle || [ligandName, `${panels.filter((p) => p.kind === "snapshot").length} views`].filter(Boolean).join(" · ");
	function onFiles(files) {
		if (!files) return;
		for (const file of [...files]) {
			if (!file.type.startsWith("image/")) continue;
			const reader = new FileReader();
			reader.onload = () => {
				const src = typeof reader.result === "string" ? reader.result : "";
				if (!src) return;
				addPanel({
					kind: "photo",
					title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
					caption: "Uploaded panel",
					src,
					span: 4
				}, { open: true });
			};
			reader.readAsDataURL(file);
		}
	}
	async function exportPng() {
		setExporting(true);
		setError(null);
		try {
			const ligandColors = {};
			for (const pose of poses) {
				const label = ligandDisplay(names, pose.id, pose.fallbackLabel);
				if (!ligandColors[label]) ligandColors[label] = pose.color;
			}
			const chart = buildAffinityChart(poses.map((p) => ({
				ligand: ligandDisplay(names, p.id, p.fallbackLabel),
				engine: p.engine.trim() || "Unknown",
				affinity: p.affinity
			})));
			const poseLabels = {};
			for (const pose of poses) poseLabels[pose.id] = ligandDisplay(names, pose.id, pose.fallbackLabel);
			await downloadDataUrl(await composeScenePng({
				title: displayTitle,
				subtitle: displaySubtitle,
				panels,
				ss,
				chart,
				fingerprint,
				poseLabels,
				ligandColors,
				chartStyle,
				interacting,
				residueRows: tabulateResidues(hits),
				commonRows: commonContacts(hitsByPose),
				poseCount: hitsByPose.length
			}), `poseatlas-scene-${displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figure"}.png`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not export the figure");
		} finally {
			setExporting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "workspace-paper fixed inset-0 z-[90] flex flex-col",
		role: "dialog",
		"aria-labelledby": "scene-title",
		style: { ["--inspector-w"]: `${inspectorW}px` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-faint uppercase",
					children: "Publication figures"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "scene-title",
					className: "font-display text-2xl leading-tight",
					children: "Paper plate"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1 font-mono text-xs tracking-widest text-faint uppercase",
						children: "Molecular"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							const existing = panels.find((p) => p.kind === "sketch");
							if (existing) {
								setSelected(existing.id);
								return;
							}
							snapshotFigure2d().then((src) => {
								if (!src) {
									setError("Open a pose to capture the 2D plate");
									return;
								}
								addPanel({
									kind: "sketch",
									title: `${ligandName || "Ligand"} 2D`,
									caption: "Pose-oriented contact map and OpenChemLib skeletal.",
									src,
									span: 6
								}, { open: true });
							});
						},
						children: "2D"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => photoRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {}), "Photo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1 hidden h-5 w-px bg-border sm:block",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1 font-mono text-xs tracking-widest text-faint uppercase",
						children: "Research"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addOnce("ss", "Secondary structure", "Kabsch–Sander DSSP."),
						children: "DSSP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addOnce("chart", "Binding affinity", "kcal/mol · more negative is stronger."),
						children: "Chart"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addOnce("contacts", "Common contacts", "Residues shared by every overlay pose.", 6),
						children: "Common"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addOnce("residues", "Interacting residues", "Tabulated pocket contacts in sequence."),
						children: "Residues"
					}),
					fingerprint.poseIds.length >= 2 && fingerprint.residues.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							const existing = panels.find((p) => p.kind === "fingerprint");
							if (existing) {
								setSelected(existing.id);
								return;
							}
							const poseLabels = {};
							for (const pose of poses) poseLabels[pose.id] = ligandDisplay(names, pose.id, pose.fallbackLabel);
							renderFingerprintPng(fingerprint, poseLabels, {
								title: "Interaction fingerprint",
								subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`
							}).then((src) => {
								addPanel({
									kind: "fingerprint",
									title: "Interaction fingerprint",
									caption: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses.`,
									src,
									span: 12
								}, { open: true });
							});
						},
						children: "Fingerprint"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: photoRef,
						type: "file",
						accept: "image/*",
						multiple: true,
						className: "sr-only",
						tabIndex: -1,
						onChange: (event) => {
							onFiles(event.target.files);
							event.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1 hidden h-5 w-px bg-border sm:block",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void exportPng(),
						disabled: exporting || !panels.length,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), exporting ? "Exporting" : "Export PNG"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setOpen(false),
						"aria-label": "Close scene",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), "Close"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col lg:flex-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-5xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: title,
								placeholder: proteinName,
								onChange: (e) => setTitle(e.target.value),
								"aria-label": "Figure title",
								className: "h-11 border-0 bg-transparent px-0 font-display text-2xl"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: subtitle,
								placeholder: displaySubtitle,
								onChange: (e) => setSubtitle(e.target.value),
								"aria-label": "Figure subtitle",
								className: "mt-1 h-8 border-0 bg-transparent px-0 text-sm text-muted"
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: error
							}) : null,
							!panels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								onPhoto: () => photoRef.current?.click(),
								onScaffold: () => ensureScaffold()
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								ref: plateRef,
								className: "scene-plate mt-5",
								children: panels.map((panel, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "scene-tile min-w-0",
									style: { ["--cols"]: `span ${clampSpan(panel.span)}` },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelCard, {
										panel,
										letter: String.fromCharCode(65 + index),
										selected: selectedId === panel.id,
										ss,
										poses,
										interacting,
										fingerprint,
										names,
										hits,
										hitsByPose,
										ssByKey,
										onSelect: () => setSelected(panel.id),
										onDragStart: () => {
											dragId.current = panel.id;
										},
										onDrop: () => {
											if (dragId.current) movePanel(dragId.current, panel.id);
											dragId.current = null;
										},
										onResize: (edge, event) => {
											startPanelResize(event, panel, edge, plateRef.current, updatePanel, setSelected);
										}
									})
								}, panel.id))
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnSplit, {
					value: inspectorW,
					min: 260,
					max: 480,
					onChange: setInspectorW,
					onReset: resetInspector,
					label: "Inspector width",
					inverted: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "scene-inspector shrink-0 border-t border-border lg:h-full lg:overflow-y-auto lg:border-t-0 lg:border-l",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-faint uppercase",
								children: "Panel"
							}),
							selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-faint",
											children: "Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-1",
											value: selected.title,
											onChange: (e) => updatePanel(selected.id, { title: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-faint",
											children: "Caption"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-1",
											value: selected.caption,
											onChange: (e) => updatePanel(selected.id, { caption: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-xs text-faint",
												children: "Width"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-mono text-xs tabular-nums text-muted",
												children: [
													clampSpan(selected.span),
													" / ",
													12
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: 1,
											max: 12,
											value: clampSpan(selected.span),
											"aria-label": "Panel width",
											className: "mt-2 h-8 w-full cursor-ew-resize accent-accent",
											onChange: (e) => updatePanel(selected.id, { span: Number(e.target.value) })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1.5 flex gap-1",
											children: SPAN_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: clampSpan(selected.span) === preset.span ? "secondary" : "ghost",
												onClick: () => updatePanel(selected.id, { span: preset.span }),
												children: preset.label
											}, preset.span))
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-xs text-faint",
											children: "Height"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono text-xs tabular-nums text-muted",
											children: [selected.height ?? defaultPanelHeight(selected.kind), " px"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: 120,
										max: 720,
										value: selected.height ?? defaultPanelHeight(selected.kind),
										"aria-label": "Panel height",
										className: "mt-2 h-8 w-full cursor-ns-resize accent-accent",
										onChange: (e) => updatePanel(selected.id, { height: Number(e.target.value) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => updatePanel(selected.id, {
												span: defaultPanelSpan(selected.kind),
												height: defaultPanelHeight(selected.kind)
											}),
											children: "Reset size"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => removePanel(selected.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Remove"]
										})]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Select a panel, then drag its edges or corner to resize. Width snaps to the twelve-column plate; height is free. Drag the grip to reorder."
							}),
							panels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "mt-6",
								onClick: () => clear(),
								children: "Clear plate"
							}) : null
						]
					})
				})
			]
		})]
	});
}
function startPanelResize(event, panel, edge, plate, updatePanel, setSelected) {
	event.preventDefault();
	event.stopPropagation();
	setSelected(panel.id);
	const handle = event.currentTarget;
	handle.setPointerCapture(event.pointerId);
	const startX = event.clientX;
	const startY = event.clientY;
	const startSpan = clampSpan(panel.span);
	const startH = panel.height ?? defaultPanelHeight(panel.kind);
	const pitch = (plate?.clientWidth ?? 1024) / 12;
	document.body.classList.add("is-panel-resizing");
	function move(ev) {
		const patch = {};
		if (edge === "e" || edge === "se") patch.span = clampSpan(startSpan + Math.round((ev.clientX - startX) / pitch));
		if (edge === "s" || edge === "se") patch.height = clampHeight(startH + (ev.clientY - startY));
		updatePanel(panel.id, patch);
	}
	function end(ev) {
		try {
			handle.releasePointerCapture(ev.pointerId);
		} catch {}
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerup", end);
		window.removeEventListener("pointercancel", end);
		document.body.classList.remove("is-panel-resizing");
	}
	window.addEventListener("pointermove", move);
	window.addEventListener("pointerup", end);
	window.addEventListener("pointercancel", end);
}
function EmptyState({ onPhoto, onScaffold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-2xl border border-dashed border-border px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: "Compose a paper plate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-4 max-w-xl space-y-2 text-sm leading-relaxed text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. In pose view, frame the 3D, then To scene (keeps your zoom) or Download." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Molecular panels: 3D snapshots and the 2D map." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Research panels: DSSP, affinity (kcal/mol), common contacts, residue table, fingerprint." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "4. Drag edges to size, caption, Export PNG on white paper." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: onScaffold,
					children: "Add DSSP + chart"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: onPhoto,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {}), "Upload photo"]
				})]
			})
		]
	});
}
function PanelCard({ panel, letter, selected, ss, poses, interacting, fingerprint, names, hits, hitsByPose, ssByKey, onSelect, onDragStart, onDrop, onResize }) {
	const mediaH = panel.height ?? defaultPanelHeight(panel.kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		onDragOver: (event) => event.preventDefault(),
		onDrop: (event) => {
			event.preventDefault();
			onDrop();
		},
		onClick: onSelect,
		className: cn("group relative cursor-pointer rounded-xl border bg-surface p-2.5 text-left transition-colors duration-150", selected ? "border-fg" : "border-border hover:border-fg/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						draggable: true,
						"aria-label": "Drag to reorder",
						className: "grid size-7 shrink-0 cursor-grab place-items-center rounded-md text-faint hover:bg-raised hover:text-fg active:cursor-grabbing",
						onClick: (event) => event.stopPropagation(),
						onDragStart: (event) => {
							event.dataTransfer.effectAllowed = "move";
							onDragStart();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-faint",
						children: letter
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate text-sm font-medium",
						children: panel.title
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 overflow-hidden rounded-lg bg-bg",
				style: { height: mediaH },
				children: panel.kind === "ss" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsMini, {
					ss,
					interacting
				}) : panel.kind === "chart" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffinityChart, { poses })
				}) : panel.kind === "fingerprint" ? panel.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: panel.src,
					alt: panel.title,
					className: "h-full w-full object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintGrid, {
						fingerprint,
						names,
						labels: Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel])),
						compact: true
					})
				}) : panel.kind === "residues" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResidueTable, {
						hits,
						ssByKey,
						ligandName: "",
						compact: true
					})
				}) : panel.kind === "contacts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactsTable, {
						rows: commonContacts(hitsByPose),
						poseCount: hitsByPose.length
					})
				}) : panel.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: panel.src,
					alt: panel.title,
					className: cn("h-full w-full", panel.kind === "photo" ? "object-cover" : "object-contain")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full items-center justify-center text-xs text-faint",
					children: "No image"
				})
			}),
			panel.caption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 px-0.5 text-xs leading-relaxed text-muted",
				children: panel.caption
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
				edge: "e",
				selected,
				onResize
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
				edge: "s",
				selected,
				onResize
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
				edge: "se",
				selected,
				onResize
			})
		]
	});
}
function ResizeHandle({ edge, selected, onResize }) {
	const label = edge === "e" ? "Resize width" : edge === "s" ? "Resize height" : "Resize width and height";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		"aria-label": label,
		title: label,
		onPointerDown: (event) => {
			if (event.button !== 0) return;
			onResize(edge, event);
		},
		onClick: (event) => event.stopPropagation(),
		className: cn("absolute z-10 touch-none transition-opacity duration-150", selected ? "opacity-100" : "opacity-0 group-hover:opacity-100", edge === "e" && "inset-y-8 right-0 w-3 cursor-ew-resize max-sm:hidden", edge === "s" && "inset-x-8 bottom-0 h-3 cursor-ns-resize", edge === "se" && "bottom-0 right-0 size-4 cursor-nwse-resize"),
		children: edge === "se" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute bottom-1 right-1 block size-2.5 border-r-2 border-b-2 border-fg/80" }) : edge === "e" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-y-6 right-1 w-px bg-fg/50" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-x-6 bottom-1 h-px bg-fg/50" })
	});
}
function SsMini({ ss, interacting }) {
	if (!ss) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-3 py-6 text-xs text-muted",
		children: "Load a structure to draw DSSP."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-hidden px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-1.5 overflow-hidden rounded-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-ss-helix",
						style: { width: `${ss.percents.helix}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-ss-sheet",
						style: { width: `${ss.percents.sheet}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-ss-turn",
						style: { width: `${ss.percents.turn}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-ss-coil",
						style: { width: `${ss.percents.coil}%` }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ss-helix",
							children: "Helix"
						}),
						" ",
						ss.percents.helix.toFixed(0),
						"%"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ss-sheet",
							children: "Sheet"
						}),
						" ",
						ss.percents.sheet.toFixed(0),
						"%"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ss-turn",
							children: "Turn"
						}),
						" ",
						ss.percents.turn.toFixed(0),
						"%"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ss-coil",
							children: "Coil"
						}),
						" ",
						ss.percents.coil.toFixed(0),
						"%"
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex h-4 overflow-hidden rounded-sm",
				children: ss.residues.map((r) => {
					const group = ssGroup(r.ss);
					const hit = interacting.has(`${r.chain}:${r.resSeq}`);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("min-w-px flex-1", group === "helix" && "bg-ss-helix", group === "sheet" && "bg-ss-sheet", group === "turn" && "bg-ss-turn", group === "coil" && "bg-ss-coil", hit && "ring-1 ring-fg/70") }, `${r.chain}:${r.resSeq}`);
				})
			})
		]
	});
}
function SsStrip({ ss, names, interacting }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!ss || !ss.residues.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border px-3 py-1.5 sm:px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs text-muted",
			children: "Secondary structure — load a PDB"
		})
	});
	const byChain = /* @__PURE__ */ new Map();
	for (const r of ss.residues) {
		const list = byChain.get(r.chain);
		if (list) list.push(r);
		else byChain.set(r.chain, [r]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative border-b border-border", open && "z-40"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((v) => !v),
			"aria-expanded": open,
			"aria-label": "Secondary structure report",
			className: "flex w-full items-center gap-3 px-3 py-1.5 text-left sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-1.5 min-w-0 flex-1 overflow-hidden rounded-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-ss-helix",
							style: { width: `${ss.percents.helix}%` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-ss-sheet",
							style: { width: `${ss.percents.sheet}%` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-ss-turn",
							style: { width: `${ss.percents.turn}%` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-ss-coil",
							style: { width: `${ss.percents.coil}%` }
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 font-mono text-xs tabular-nums text-muted",
					children: [
						ss.percents.helix.toFixed(0),
						"% helix · ",
						ss.percents.sheet.toFixed(0),
						"% sheet · ",
						ss.residues.length,
						" aa"
					]
				}),
				open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5 shrink-0 text-faint" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 shrink-0 text-faint" })
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 top-full z-40 max-h-[min(50vh,22rem)] overflow-y-auto border-b border-border bg-surface px-3 py-3 shadow-xl sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: "Kabsch–Sander DSSP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted",
						children: [
							ss.helixCount,
							" helices · ",
							ss.strandCount,
							" strands"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ss-helix",
								children: "Helix"
							}),
							" ",
							ss.percents.helix.toFixed(0),
							"%"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ss-sheet",
								children: "Sheet"
							}),
							" ",
							ss.percents.sheet.toFixed(0),
							"%"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ss-turn",
								children: "Turn"
							}),
							" ",
							ss.percents.turn.toFixed(0),
							"%"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ss-coil",
								children: "Coil"
							}),
							" ",
							ss.percents.coil.toFixed(0),
							"%"
						] }),
						ss.meanHelixLength ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-faint",
							children: [
								"⟨helix⟩ ",
								ss.meanHelixLength.toFixed(1),
								" res"
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-3 lg:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1 space-y-2",
						children: [...byChain.entries()].map(([chain, residues]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChainStrip, {
							chain,
							domain: chainDisplay(names, chain),
							residues,
							interacting
						}, chain))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ramachandran, {
						residues: ss.residues,
						interacting
					})]
				})
			]
		}) : null]
	});
}
function ChainStrip({ chain, domain, residues, interacting }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mb-1 font-mono text-xs text-faint",
		children: [
			domain,
			domain !== `Chain ${chain}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", chain] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums",
				children: [" · ", residues.length]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-4 overflow-hidden rounded-sm",
		children: residues.map((r) => {
			const key = `${r.chain}:${r.resSeq}`;
			const group = ssGroup(r.ss);
			const hit = interacting.has(key);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				title: `${prettyResidue(r.resName, r.resSeq, r.chain)} · ${ssLabel(r.ss)}${hit ? " · contacting" : ""}`,
				className: cn("min-w-px flex-1", group === "helix" && "bg-ss-helix", group === "sheet" && "bg-ss-sheet", group === "turn" && "bg-ss-turn", group === "coil" && "bg-ss-coil", hit && "ring-1 ring-fg/70")
			}, key);
		})
	})] });
}
function Ramachandran({ residues, interacting }) {
	const w = 128;
	const pad = 14;
	const inner = 100;
	const map = (phi, psi) => ({
		x: pad + (phi + 180) / 360 * inner,
		y: pad + (180 - psi) / 360 * inner
	});
	const plotted = residues.filter((r) => r.phi !== null && r.psi !== null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden shrink-0 lg:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 font-mono text-xs tracking-widest text-faint uppercase",
			children: "Ramachandran"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: w,
			height: w,
			viewBox: `0 0 ${w} ${w}`,
			className: "rounded-lg border border-border bg-bg",
			"aria-label": "Ramachandran plot",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: pad,
					y1: w / 2,
					x2: 114,
					y2: w / 2,
					stroke: "#26262b"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: w / 2,
					y1: pad,
					x2: w / 2,
					y2: 114,
					stroke: "#26262b"
				}),
				plotted.map((r) => {
					const p = map(r.phi, r.psi);
					const key = `${r.chain}:${r.resSeq}`;
					const group = ssGroup(r.ss);
					const fill = group === "helix" ? "#c97878" : group === "sheet" ? "#7a9ed4" : group === "turn" ? "#6aaa8c" : "#8a8c90";
					const hit = interacting.has(key);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: p.x,
						cy: p.y,
						r: hit ? 2.4 : 1.4,
						fill,
						opacity: hit ? 1 : .7
					}, key);
				})
			]
		})]
	});
}
var MODE_HUD = {
	interaction: {
		title: "Bonds",
		hint: "Cartoon + contacting side chains"
	},
	pocket: {
		title: "Pocket",
		hint: "Cutaway SAS around the ligand"
	},
	electrostatic: {
		title: "Electrostatic",
		hint: "Coulombic SAS · red − · blue +"
	},
	hydrophobic: {
		title: "Hydrophobic",
		hint: "Kyte–Doolittle hydropathy"
	}
};
function Studio() {
	const [methodsOpen, setMethodsOpen] = (0, import_react.useState)(false);
	const [mobileTab, setMobileTab] = (0, import_react.useState)("scene");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [saveLabel, setSaveLabel] = (0, import_react.useState)("To scene");
	const loadLibraryTarget = useSession((s) => s.loadLibraryTarget);
	const loadFiles = useSession((s) => s.loadFiles);
	const addFiles = useSession((s) => s.addFiles);
	const setDropActive = useSession((s) => s.setDropActive);
	const dropActive = useSession((s) => s.dropActive);
	const hydrating = useSession((s) => s.hydrating);
	const loadError = useSession((s) => s.loadError);
	const poses = useSession((s) => s.poses);
	const names = useSession((s) => s.names);
	const figureMode = useSession((s) => s.figureMode);
	const setFigureMode = useSession((s) => s.setFigureMode);
	const spin = useSession((s) => s.spin);
	const setSpin = useSession((s) => s.setSpin);
	const frame = useSession((s) => s.frame);
	const setFrame = useSession((s) => s.setFrame);
	const labelsOn = useSession((s) => s.labelsOn);
	const setLabelsOn = useSession((s) => s.setLabelsOn);
	const overlayAll = useSession((s) => s.overlayAll);
	const chartOpen = useSession((s) => s.chartOpen);
	const setChartOpen = useSession((s) => s.setChartOpen);
	const addSnapshot = useScene((s) => s.addSnapshot);
	const setSceneOpen = useScene((s) => s.setOpen);
	const sceneCount = useScene((s) => s.panels.length);
	const setSceneTitle = useScene((s) => s.setTitle);
	const sceneNotice = useScene((s) => s.notice);
	const setSceneNotice = useScene((s) => s.setNotice);
	const toggleVisible = useSession((s) => s.toggleVisible);
	const libraryTargetId = useSession((s) => s.libraryTargetId);
	const kind = useSession((s) => s.kind);
	const libraryW = useChrome((s) => s.libraryW);
	const diagramW = useChrome((s) => s.diagramW);
	const setLibraryW = useChrome((s) => s.setLibraryW);
	const setDiagramW = useChrome((s) => s.setDiagramW);
	const resetLibrary = useChrome((s) => s.resetLibrary);
	const resetDiagram = useChrome((s) => s.resetDiagram);
	const hydrateChrome = useChrome((s) => s.hydrate);
	const analysis = useAnalysis();
	const { receptor, focused, visible, ss, focusedHits, fingerprint, pocketKeys, charges, proteinName, focusedLabel, caption } = analysis;
	(0, import_react.useEffect)(() => {
		if (!poses.length) loadLibraryTarget("4zbe");
	}, []);
	(0, import_react.useEffect)(() => {
		hydrateChrome();
	}, [hydrateChrome]);
	(0, import_react.useEffect)(() => {
		if (!proteinName) return;
		if (!useScene.getState().title) setSceneTitle(proteinName);
	}, [proteinName, setSceneTitle]);
	(0, import_react.useEffect)(() => {
		if (!sceneNotice) return;
		setSaveLabel("Saved");
		const t = window.setTimeout(() => {
			setSceneNotice(null);
			setSaveLabel("To scene");
		}, 1600);
		return () => window.clearTimeout(t);
	}, [sceneNotice, setSceneNotice]);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			const tag = event.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (event.key >= "1" && event.key <= "9") {
				const pose = poses[Number(event.key) - 1];
				if (pose) toggleVisible(pose.id);
			}
			if (event.key === "[" || event.key === "]") {
				const dir = event.key === "]" ? 1 : -1;
				const next = TARGETS[(TARGETS.findIndex((t) => t.id === libraryTargetId) + dir + TARGETS.length) % TARGETS.length];
				if (next) loadLibraryTarget(next.id);
			}
			if (event.key === "s" || event.key === "S") setSpin((v) => !v);
			if (event.key === "o" || event.key === "O") overlayAll();
			if (event.key === "l" || event.key === "L") setLabelsOn(!labelsOn);
			if (event.key === "c" || event.key === "C") setChartOpen(!useSession.getState().chartOpen);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		poses,
		libraryTargetId,
		labelsOn,
		loadLibraryTarget,
		overlayAll,
		setLabelsOn,
		setSpin,
		toggleVisible,
		setChartOpen
	]);
	(0, import_react.useEffect)(() => {
		function isFileDrag(event) {
			return Array.from(event.dataTransfer?.types ?? []).includes("Files");
		}
		function onEnter(event) {
			if (!isFileDrag(event)) return;
			event.preventDefault();
			setDropActive(true);
		}
		function onOver(event) {
			if (!isFileDrag(event)) return;
			event.preventDefault();
		}
		function onLeave(event) {
			if (event.relatedTarget) return;
			setDropActive(false);
		}
		function onDrop(event) {
			event.preventDefault();
			setDropActive(false);
			const files = [...event.dataTransfer?.files ?? []];
			if (files.length) {
				if (useSession.getState().poses.length) addFiles(files);
				else loadFiles(files);
			}
		}
		window.addEventListener("dragenter", onEnter);
		window.addEventListener("dragover", onOver);
		window.addEventListener("dragleave", onLeave);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragenter", onEnter);
			window.removeEventListener("dragover", onOver);
			window.removeEventListener("dragleave", onLeave);
			window.removeEventListener("drop", onDrop);
		};
	}, [
		addFiles,
		loadFiles,
		setDropActive
	]);
	const ssByKey = (0, import_react.useMemo)(() => {
		const rec = {};
		if (!ss) return rec;
		for (const r of ss.residues) rec[`${r.chain}:${r.resSeq}`] = r.ss;
		return rec;
	}, [ss]);
	const interacting = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const h of focusedHits) set.add(`${h.chain}:${h.resSeq}`);
		return set;
	}, [focusedHits]);
	const residueLabels = (0, import_react.useMemo)(() => {
		const rec = {};
		for (const h of focusedHits) rec[`${h.chain}:${h.resSeq}`] = prettyResidue(h.resName, h.resSeq, h.chain);
		return rec;
	}, [focusedHits]);
	const engines = [...new Set(visible.map((p) => p.engine).filter(Boolean))];
	const ligandLayers = visible.map((pose) => ({
		id: pose.id,
		pdb: pose.pdb,
		color: pose.color,
		label: engines.length > 1 ? `${ligandDisplay(names, pose.id, pose.fallbackLabel)} · ${pose.engine}` : ligandDisplay(names, pose.id, pose.fallbackLabel)
	}));
	const overlay = visible.length > 1;
	const target = TARGETS.find((t) => t.id === libraryTargetId);
	const otherLigands = (0, import_react.useMemo)(() => {
		if (!focused) return [];
		return visible.filter((p) => p.id !== focused.id).map((p) => ({
			name: ligandDisplay(names, p.id, p.fallbackLabel),
			atoms: ligandAtoms(p.inventory)
		}));
	}, [
		focused,
		visible,
		names
	]);
	const hud = MODE_HUD[figureMode];
	async function captureView() {
		setSpin(false);
		let uri = await snapshotViewerAsync();
		if (!uri) {
			await new Promise((resolve) => window.setTimeout(resolve, 700));
			uri = await snapshotViewerAsync();
		}
		return uri;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadBar, { onMethods: () => setMethodsOpen(true) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1 border-b border-border px-3 py-1 lg:hidden",
				children: [
					["structure", "Library"],
					["scene", "Pose"],
					["residues", "Residues"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMobileTab(id),
					className: cn("min-h-10 flex-1 rounded-md px-2 text-sm", mobileTab === id ? "bg-raised text-fg" : "text-muted"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:flex-row",
				style: {
					["--library-w"]: `${libraryW}px`,
					["--diagram-w"]: `${diagramW}px`
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: cn("studio-library relative z-10 min-h-0 shrink-0 overflow-y-auto border-b border-border lg:h-full lg:border-r lg:border-b-0", mobileTab === "structure" ? "block" : "hidden lg:block"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryPanel, {
							receptor,
							poses
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnSplit, {
						value: libraryW,
						min: 220,
						max: 440,
						onChange: setLibraryW,
						onReset: resetLibrary,
						label: "Library width"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: cn("relative z-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden", mobileTab === "scene" ? "flex" : "hidden lg:flex"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "shrink-0 border-b border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3 px-3 pt-2 sm:px-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "min-w-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
											className: "truncate font-display text-lg leading-tight sm:text-xl",
											children: [proteinName, kind === "library" && target ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-2 font-sans font-mono text-xs tracking-wide text-muted uppercase",
												children: [
													target.pdbId,
													" · ",
													target.gene
												]
											}) : null]
										})
									}), focused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden shrink-0 font-mono text-xs tracking-wide text-muted uppercase sm:inline",
										children: focusedLabel
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigureToolbar, {
									mode: figureMode,
									spin,
									frame,
									labelsOn,
									overlay,
									chartOpen,
									sceneCount,
									saveLabel,
									onMode: setFigureMode,
									onSpin: () => setSpin((v) => !v),
									onFrame: () => setFrame(frame === "ligand" ? "complex" : "ligand"),
									onLabels: () => setLabelsOn(!labelsOn),
									onOverlayAll: overlayAll,
									onChart: () => setChartOpen(!chartOpen),
									onScene: () => setSceneOpen(true),
									onSnapshot: () => {
										(async () => {
											setSaveLabel("Saving");
											const uri = await captureView();
											if (!uri) {
												setSaveLabel("To scene");
												setSceneNotice("3D not ready — wait for the pocket, then To scene");
												return;
											}
											const modeTitle = FIGURE_TITLES[figureMode] ?? figureMode;
											const title = overlay ? `${modeTitle} · overlay` : modeTitle;
											addSnapshot({
												title,
												caption,
												src: uri,
												span: 6
											});
										})();
									},
									onDownload: () => {
										(async () => {
											const uri = await captureView();
											if (!uri) {
												setSceneNotice("3D not ready — wait for the pocket, then Download");
												return;
											}
											await downloadDataUrl(uri, `poseatlas-${(FIGURE_TITLES[figureMode] ?? figureMode).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "view"}.png`);
										})();
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsStrip, {
								ss,
								names,
								interacting
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-stage shrink-0 lg:h-full lg:min-h-0 lg:flex-1 lg:shrink",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative h-[min(48vh,28rem)] min-h-[16rem] min-w-0 lg:h-full lg:min-h-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MolCanvas, {
													proteinPdb: receptor?.pdb ?? focused?.pdb ?? null,
													ligands: ligandLayers,
													figureMode,
													spin,
													focus: frame,
													interactions: focusedHits,
													ssByKey,
													pocketKeys: [...pocketKeys],
													labelsOn,
													charges,
													residueLabels,
													className: "absolute inset-0"
												}),
												hydrating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "absolute bottom-4 left-4 font-mono text-xs text-muted",
													children: "Reading coordinates"
												}) : null,
												loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "absolute bottom-4 left-4 font-mono text-xs text-muted",
													children: loadError
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "hud-paper pointer-events-none absolute left-3 top-3 z-20 rounded-lg px-3 py-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-mono text-xs tracking-widest text-faint uppercase",
														children: hud.title
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-0.5 text-xs text-muted",
														children: hud.hint
													})]
												}),
												figureMode === "electrostatic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "hud-paper pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg px-2 py-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex h-16 w-1.5 flex-col overflow-hidden rounded-full",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-aa-acidic" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-accent" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-aa-basic" })
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "font-mono text-xs leading-4 text-muted",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "−" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-3",
																children: "0"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-3",
																children: "+"
															})
														]
													})]
												}) : null,
												figureMode === "hydrophobic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "hud-paper pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg px-2 py-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex h-16 w-1.5 flex-col overflow-hidden rounded-full",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-aa-hydrophobic" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-accent" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 bg-aa-polar" })
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "font-mono text-xs leading-4 text-muted",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "φ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-6",
															children: "polar"
														})]
													})]
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
													layers: ligandLayers,
													overlay
												}),
												chartOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "figure-2d absolute inset-x-0 bottom-0 z-30 max-h-[46%] overflow-y-auto border-t border-border",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AffinityChart, { poses })
												}) : null,
												saveLabel === "Saving" || sceneNotice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "hud-paper pointer-events-none absolute right-3 top-3 z-30 rounded-md px-3 py-1.5 font-mono text-xs",
													children: sceneNotice ?? "Capturing view"
												}) : null
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColumnSplit, {
											value: diagramW,
											min: 280,
											max: 640,
											onChange: setDiagramW,
											onReset: resetDiagram,
											label: "2D column width",
											inverted: true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "figure-2d border-t border-border lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l",
											children: [
												focused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Diagram2D, {
													ligand: ligandAtoms(focused.inventory),
													hits: focusedHits,
													ligandName: focusedLabel,
													otherLigands
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "px-4 py-3 text-sm text-muted",
													children: hydrating ? "Reading coordinates" : "Load a pose to draw the 2D map."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "hidden border-t border-border lg:block",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResidueTable, {
														hits: focusedHits,
														ssByKey,
														ligandName: focusedLabel,
														compact: true
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "hidden lg:block",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintGrid, {
														fingerprint,
														names,
														labels: Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel])),
														figure: true
													})
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-start justify-between gap-3 border-t border-border px-4 py-1.5 sm:px-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 text-xs leading-relaxed text-muted sm:text-sm",
										children: caption
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										className: "shrink-0",
										onClick: () => {
											navigator.clipboard.writeText(caption);
											setCopied(true);
											window.setTimeout(() => setCopied(false), 1200);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), copied ? "Copied" : "Caption"]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: cn("figure-2d relative z-10 flex min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-border lg:hidden", mobileTab === "residues" ? "flex" : "hidden"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResidueTable, {
							hits: focusedHits,
							ssByKey,
							ligandName: focusedLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintGrid, {
							fingerprint,
							names,
							labels: Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel]))
						})]
					})
				]
			}),
			dropActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-bg/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface px-8 py-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: "Drop PDB files"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Protein–ligand complexes from any docking engine. Drop on an open session to overlay another engine."
					})]
				})
			}) : null,
			methodsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodsDialog, { onClose: () => setMethodsOpen(false) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneBoard, {
				ss,
				poses,
				names,
				interacting,
				proteinName,
				ligandName: focusedLabel,
				fingerprint,
				hits: focusedHits,
				hitsByPose: analysis.hitsByPose,
				ssByKey
			})
		]
	});
}
function Legend({ layers, overlay }) {
	if (!layers.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hud-paper pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tracking-widest text-faint uppercase",
			children: overlay ? "Overlay" : "Ligand"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-1.5 space-y-1",
			children: layers.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-1.5 rounded-full",
					style: { background: layer.color }
				}), layer.label]
			}, layer.id))
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };

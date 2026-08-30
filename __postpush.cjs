const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const cwd = path.resolve(__dirname);
const LOG = path.join(cwd, "STATO-POST-PUSH.txt");
const L = [];
function w(){ fs.writeFileSync(LOG, L.join("\n"), "utf-8"); }
function run(cmd, args, extra_opts={}) {
  try {
    const r = spawnSync(cmd, args, Object.assign({ encoding: "utf-8", windowsHide: true, timeout: 20_000, maxBuffer: 50*1024*1024, stdio:["ignore","pipe","pipe"], shell: false, cwd }, extra_opts||{}));
    return { ok: (r.status??-1)===0, exit: r.status??-1, out: (r.stdout||"").replace(/\r/g,""), err: (r.stderr||"").replace(/\r/g,"") };
  } catch(e){ return { ok:false, exit:-999, out:"", err:"", ex: (e.stack||e.message) }; }
}

L.push("============================================================");
L.push(" STATO REPO POST-PUSH  "+new Date().toISOString());
L.push("============================================================");
const h1 = run("git",["rev-parse","HEAD"]);
const h2 = run("git",["rev-parse","origin/main"]);
L.push("HEAD locale   : "+(h1.ok?h1.out.trim():"ERRORE exit="+h1.exit+" "+(h1.err||h1.out).trim()));
L.push("origin/main   : "+(h2.ok?h2.out.trim():"ERRORE exit="+h2.exit+" "+(h2.err||h2.out).trim()));
L.push("");
L.push("👉 CONFRONTO HASH:");
if (h1.ok && h2.ok && (h1.out.trim() === h2.out.trim())) L.push("✅ IDENTICI = PUSH RIUSCITO. GitHub è AGGIORNATO.");
else L.push("❌ DIVERSI = PUSH NON RIUSCITO (ancora da mandare). HEAD locale è 'ahead' di "+(h2.ok?h2.out.trim():"?")+".");
w();

L.push("");
L.push("============================================================");
L.push(" ULTIMI 4 COMMIT (oneline):");
L.push("============================================================");
const gl = run("git",["log","--oneline","-n","4"]);
if (gl.ok) L.push(gl.out.trimEnd()); else L.push("ERR exit="+gl.exit+" "+gl.err.trim());
w();

L.push("");
L.push("============================================================");
L.push(" CONTENUTO ULTIMO COMMIT (ultimo commit che hai fatto tu):");
L.push("============================================================");
const sh = run("git",["show","--stat","--summary","HEAD"]);
if (sh.ok) L.push(sh.out.trimEnd().split("\n").slice(0,80).join("\n"));
else L.push("ERR exit="+sh.exit+" "+sh.err.trim());
w();

L.push("");
L.push("============================================================");
L.push(" FILE FISICO OGGI public/videos/farcom-hero.mp4 (dimensione):");
L.push("============================================================");
const vf = path.join(cwd,"public","videos","farcom-hero.mp4");
try { const s = fs.statSync(vf); L.push("PATH: "+vf); L.push("BYTES: "+s.size+"  ("+Math.round(s.size/1024)+" KB)"); L.push("MTIME: "+s.mtime.toISOString()); }
catch(e){ L.push("FILE NON TROVATO: "+e.message); }
w();

L.push("");
L.push("============================================================");
L.push(" GIT STATUS (working tree pulito?):");
L.push("============================================================");
const gs = run("git",["status","-sb"]);
if (gs.ok) L.push(gs.out.trimEnd()); else L.push("ERR exit="+gs.exit+" "+gs.err.trim());
w();

L.push("");
L.push("============================================================");
L.push(" Remote URL:");
L.push("============================================================");
const rv = run("git",["remote","-v"]);
if (rv.ok) L.push(rv.out.trimEnd()); else L.push("ERR exit="+rv.exit+" "+rv.err.trim());
L.push("");
L.push("FINE. log file: "+LOG);
w();

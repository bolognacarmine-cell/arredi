const { spawnSync, execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cwd = path.resolve(__dirname);
const LOG = path.join(cwd, "__DIAG-GIT.txt");
const L = [];
function w(){ fs.writeFileSync(LOG, L.join("\n"), "utf-8"); }
function run(cmd, args, opts={}) {
  try {
    const r = spawnSync(cmd, args, { encoding: "utf-8", windowsHide: true, timeout: 15_000, maxBuffer: 20*1024*1024, stdio:["ignore","pipe","pipe"], shell: opts.shell || false, cwd: opts.cwd || cwd });
    return {ok:(r.status??-1)===0, exit:r.status??-1, out:(r.stdout||"").replace(/\r/g,""), err:(r.stderr||"").replace(/\r/g,""), ex: r.error ? (r.error.stack||r.error.message) : ""};
  } catch(e){ return {ok:false, exit:-999, ex:e.stack||e.message}; }
}
function section(title){ L.push(""); L.push("=".repeat(100)); L.push("  "+title); L.push("=".repeat(100)); w(); }

section("INFO AMBIENTE");
L.push("Date: " + new Date().toISOString());
L.push("Platform: " + process.platform + " " + process.arch);
L.push("HOME dir: " + os.homedir());
L.push("CWD repo: " + cwd);
try { const v = run("git",["--version"]); L.push("Git version (PATH): "+(v.ok?v.out.trim():"NON TROVATO exit="+v.exit)); } catch(e){ L.push("Git version check ERR "+e.message); }
try { const v = run("where",["git"],{shell:false}); L.push("where git: "+(v.ok?v.out.trim():"?")); } catch(e){ L.push("ERR where git"); }
L.push("PATH first 8 entries:");
(process.env.PATH||"").split(path.delimiter).slice(0,8).forEach(p=>L.push("  "+p));
w();

section("GIT CONFIG — 3 LIVELLI (system / global / local)");
for (const scope of [["--system","SYSTEM"],["--global","GLOBAL"],["--local  (repo .git/config)","LOCAL"]]) {
  L.push("");
  L.push(`— ${scope[1]} (flag: ${scope[0].trim()})`);
  const args = scope[0].trim() === "LOCAL" ? ["config","--list","--show-origin","--local"] : ["config","--list","--show-origin",scope[0].trim()];
  const r = run("git", args);
  L.push("  exit="+r.exit);
  const lines = (r.out + r.err).split("\n").filter(Boolean);
  // Filtra solo le voci rilevanti per push/autenticazione: remote|credential|user|http|url|insteadOf|core.ssh
  const keys = /remote\.|credential|user\.|http\.|url\."|insteadOf|core\.ssh|includeIf/i;
  const filtered = lines.filter(l=>keys.test(l));
  if (filtered.length) L.push(...filtered.map(l=>"  "+l));
  else if (lines.length) L.push("  (nessuna voce rilevante per auth/push trovata — list completo: "+lines.length+" righe)");
  else L.push("  (nessuna impostazione in questo scope)");
}
w();

section("FILE FISICI — .ssh + .gitconfig su disco (solo percorsi+hash dimensioni, NO contenuti CHIAVI PRIVATE)");
const home = os.homedir();
const checks = [
  path.join(home, ".gitconfig"),
  path.join(home, ".ssh", "config"),
  path.join(home, ".ssh", "id_ed25519.pub"),
  path.join(home, ".ssh", "id_ed25519"),
  path.join(home, ".ssh", "id_rsa.pub"),
  path.join(home, ".ssh", "id_rsa"),
  path.join(home, ".ssh", "known_hosts"),
];
checks.forEach(f=>{
  try { const s = fs.statSync(f); L.push(`  ${s.isDirectory()?"<DIR>":"FILE"}  ${String(s.size).padStart(10," ")}B  ${f}`); }
  catch(e){ L.push(`  NOT FOUND  — ${f}`); }
});
// Sola LETTURA contenuto .gitconfig e .ssh/config (sono testo, nessuna chiave privata)
const readSafe = (f, label, maxLines=200) => {
  try { if (!fs.existsSync(f)) return; L.push(""); L.push(`— Contenuto ${label} (${f}):`);
    const txt = fs.readFileSync(f,"utf-8").replace(/\r/g,"").split("\n").slice(0,maxLines);
    txt.forEach(l=>L.push("  "+l));
  } catch(e){ L.push(`  ERR read ${label}: ${e.message}`); }
};
readSafe(path.join(home,".gitconfig"), "~/.gitconfig", 250);
readSafe(path.join(home,".ssh","config"), "~/.ssh/config", 250);
// Solo PUBKEY (ok condividere)
readSafe(path.join(home,".ssh","id_ed25519.pub"), "id_ed25519.pub (CHIAVE PUBBLICA)", 5);
readSafe(path.join(home,".ssh","id_rsa.pub"), "id_rsa.pub (CHIAVE PUBBLICA)", 5);
w();

section("REMOTE URL + TENTATIVO PUSH ASCIUTTO (senza mandare nulla: --dry-run)");
const rv = run("git",["remote","-v"]); L.push("git remote -v: exit="+rv.exit+"\n"+["  "+(rv.out+rv.err).trim()].filter(Boolean).join("\n"));
const dr = run("git",["push","--dry-run","origin","main"]);
L.push("");
L.push("git push --dry-run origin main  (dry = NON invia nulla, solo autentica):");
L.push("  exit="+dr.exit);
if (dr.out.trim()) L.push("  STDOUT: "+dr.out.trimEnd().split("\n").map(l=>"    "+l).join("\n"));
if (dr.err.trim()) L.push("  STDERR: "+dr.err.trimEnd().split("\n").slice(0,40).map(l=>"    "+l).join("\n"));
if (dr.ex) L.push("  EXCEPTION: "+dr.ex.split("\n")[0]);
// Interpreta l'exit code e stampa diagnosi nota
L.push("");
L.push("→ INTERPRETAZIONE exit dry-run:");
if (dr.exit === 0) L.push("  ✅ 0 — AUTENTICAZIONE RIUSCITA + nessun push pendente (tutto pushato) — tutto OK.");
else if (/Permission to .* denied/i.test(dr.out+dr.err)) L.push("  ❌ ~128 — SSH CHIAVE SBAGLIATA ACCOUNT (autorizzato account X ma repo di Y). Vedi output STDERR riga con 'denied to ...'");
else if (/could not resolve host|timed out|DNS/.test(dr.out+dr.err)) L.push("  ❌ Sandbox DNS/RETE bloccata (non trova github.com) — limitazione TRAE sandbox, non tua colpa.");
else if (/prompt|Password|Username|Credentials|login|Logon failed/i.test(dr.out+dr.err)) L.push("  ⚠️  Credential Manager non ha credenziali / scadute — serve UI interattiva che nel sandbox non c'e'.");
else if (/Repository not found|404/i.test(dr.out+dr.err)) L.push("  ❌ URL remoto sbagliato o repo non esiste.");
else if (/Everything up-to-date/.test(dr.out+dr.err)) L.push("  ℹ️  exit 0 o !=0 ma everything up-to-date — gia tutto pushato.");
else L.push("  ℹ️  Exit "+dr.exit+" non standard — vedi STDERR sopra.");
w();

section("CREDENTIAL HELPER ATTIVO (quello che Git usera' per chiedere/salvare password/Token)");
const creds = run("git",["config","--show-origin","--get-all","credential.helper"]);
L.push("credential.helper impostati: exit="+creds.exit);
(creds.out+creds.err).split("\n").filter(Boolean).forEach(l=>L.push("  "+l));
// Test: quale helper useresti per github.com? Git 2.x ha credential helper diagnose
try {
  const diag = run("git",["credential","fill"], { timeout: 5000 });
  // Non mandiamo password, scriviamo solo le info che da solo stampa
  // Per sicurezza scriviamo solo protocollo/host
  const got = (diag.out + diag.err).split("\n").filter(l=>/^(protocol|host|username|password=)/i.test(l)).map(l=>{
    if (/^password=/i.test(l)) return "  password=<REDACTED (mai mostrata)>";
    return "  "+l;
  });
  if (got.length) { L.push(""); L.push("Credential 'fill' per default (timeout 5s):"); L.push(...got); }
} catch(e){}
w();

section("SUMMARY PUNTO PER PUNTO — Possibili cause push fallisce in sandbox");
const pushOk = dr.exit === 0 || /Everything up-to-date/.test(dr.out+dr.err);
if (pushOk) L.push("✅ A. In questo ambiente, push asciutto riesce — se fallivi prima era per PSReadLine che crashava la console, NON per git.");
else {
  if (/Permission to .* denied/i.test(dr.out+dr.err)) L.push("❌ B. SSH KEY ACCOUNT SBAGLIATO (chiave locale collegata a iodicesindaco ma repo è bolognacarmine-cell). Soluzione: URL remoto DEVE essere HTTPS (non git@github.com:...) per usare Credential Manager.");
  else if (/could not resolve host|DNS|timed out|getaddrinfo/.test(dr.out+dr.err)) L.push("❌ C. SANDBOX TRAE BLOCCA DNS/RETE in alcuni processi spawnati. Soluzione: push fuori da TRAE o usare wrapper Node.js che scrive log su file (come abbiamo fatto stanotte).");
  else if (/Username for|Password for|failed to prompt|cannot prompt/i.test(dr.out+dr.err)) L.push("❌ D. CREDENTIAL MANAGER NON HA SALVATO LE CREDEZIALI e non puo' aprire la finestra UI dentro il sandbox. Soluzione: fai 1 login nel tuo CMD VERO fuori da TRAE, salva in WinCredMgr, poi nel sandbox trova le credenziali e funziona.");
  else L.push("ℹ️  E. Altro motivo non noto. STDERR completo sopra per capire.");
}
L.push("");
L.push("Link file diagnostica completa: "+LOG);
w();

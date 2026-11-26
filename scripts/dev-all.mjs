// Jalankan dua project sekaligus: studio nota (root) + Joyco Mart (web/).
//   pnpm dev:all        → studio :3001, mart :3002
// Ctrl+C mematikan keduanya. Tanpa dependency tambahan.

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const win = process.platform === "win32";

const apps = [
  { name: "studio", color: 36, cwd: root, port: 3001 },
  { name: "mart  ", color: 34, cwd: join(root, "web"), port: 3002 },
];

const tag = (app) => `\x1b[${app.color}m[${app.name}]\x1b[0m `;

function run(cmd, args, app) {
  const env = { ...process.env, FORCE_COLOR: "1" };
  // Windows butuh shell untuk pnpm.cmd; kirim satu string supaya Node tidak
  // memperingatkan soal argumen yang tidak di-escape (semua argumen di sini statis).
  const child = win
    ? spawn([cmd, ...args].join(" "), { cwd: app.cwd, shell: true, env })
    : spawn(cmd, args, { cwd: app.cwd, env });
  const pipe = (stream, out) => {
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() ?? "";
      for (const line of lines) out.write(tag(app) + line + "\n");
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  return child;
}

const once = (child) => new Promise((resolve) => child.on("exit", resolve));

/**
 * Server Next lama dari project ini (mis. sisa terminal yang ditutup paksa)
 * masih memegang port 3001/3002 → Next menolak start ("Another next dev
 * server is already running") dan browser menampilkan error. Hentikan dulu,
 * tapi HANYA proses `next` yang path-nya di dalam folder project ini.
 */
function killStaleServers() {
  if (!win) return;
  const ps = `
    $root = '${root.replace(/'/g, "''")}'
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
      Where-Object { $_.CommandLine -and $_.CommandLine.Contains($root) -and $_.CommandLine -match 'next' -and $_.ProcessId -ne ${process.pid} } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }`;
  const res = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" });
  const killed = (res.stdout || "").split(/\s+/).filter(Boolean);
  if (killed.length) console.log(`  Menghentikan server lama: PID ${killed.join(", ")}`);
}

killStaleServers();

// Pasang dependency dulu bila belum ada.
for (const app of apps) {
  if (!existsSync(join(app.cwd, "node_modules", "next"))) {
    process.stdout.write(tag(app) + "node_modules belum ada, pnpm install...\n");
    const code = await once(run("pnpm", ["install"], app));
    if (code !== 0) process.exit(code ?? 1);
  }
}

const children = apps.map((app) => run("node", ["node_modules/next/dist/bin/next", "dev", "--port", String(app.port)], app));

console.log(
  "\n  \x1b[1mJOYCO dev\x1b[0m\n" +
    apps.map((a) => `  ${tag(a)}http://localhost:${a.port}`).join("\n") +
    "\n  Ctrl+C untuk berhenti.\n",
);

let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  for (const c of children) {
    if (c.exitCode !== null) continue;
    if (win) spawn("taskkill", ["/pid", String(c.pid), "/T", "/F"], { stdio: "ignore" });
    else c.kill("SIGINT");
  }
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

// Bila satu mati, matikan yang lain juga supaya tidak ada proses yatim.
await Promise.race(children.map(once));
stop();
await Promise.all(children.map(once));

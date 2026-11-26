/* Diagram alur untuk halaman login admin — diambil dari gerbang studio nota
   (app/gate/page.tsx) supaya dua produk JOYCO memakai bahasa visual yang sama. */


/**
 * Diagram garis beranimasi (gaya xmcp.dev): item → nota → hasil.
 * Titik biru mengalir lewat konektor bertitik, baris nota "tercetak",
 * lalu segel, PNG, dan printer menyala bergantian. Satu siklus 3 detik.
 */
const CYCLE = "3s";
const ROWS = [44, 80, 116];

export function FlowReceipt() {
  // Nota di tengah dengan tepi bawah bergerigi.
  const rx = 160;
  const ry = 42;
  const rw = 48;
  const rh = 74;
  const teeth = 6;
  const tw = rw / teeth;
  let edge = `M${rx},${ry}H${rx + rw}V${ry + rh}`;
  for (let i = 0; i < teeth; i++) {
    edge += `L${rx + rw - tw * (i + 0.5)},${ry + rh - 4}L${rx + rw - tw * (i + 1)},${ry + rh}`;
  }
  edge += "Z";
  const printLines = [
    { y: 64, x2: 198 },
    { y: 72, x2: 192 },
    { y: 80, x2: 198 },
    { y: 88, x2: 188 },
  ];

  const inPaths = ROWS.map((y) => (y === 80 ? "M52,80H156" : `M52,${y}H104V80H156`));
  const outPaths = ROWS.map((y) => (y === 80 ? "M212,80H292" : `M212,80H252V${y}H292`));

  return (
    <svg viewBox="18 30 312 100" preserveAspectRatio="xMidYMid meet" aria-hidden className="flow">
      {/* Konektor bertitik yang "mengalir". */}
      {ROWS.map((y) => (
        <path key={`in-${y}`} d={`M50,${y}H104`} className="flow-dots" />
      ))}
      <path d="M104,44V116" className="flow-bus" />
      <path d="M104,80H156" className="flow-dots" />
      <path d="M212,80H252" className="flow-dots" />
      <path d="M252,44V116" className="flow-bus" />
      {ROWS.map((y) => (
        <path key={`out-${y}`} d={`M252,${y}H290`} className="flow-dots" />
      ))}

      {/* Simpul di persimpangan: penuh & berongga, seperti xmcp. */}
      <circle cx="104" cy="44" r="2" className="flow-node" />
      <circle cx="104" cy="80" r="2" className="flow-node is-hollow" />
      <circle cx="104" cy="116" r="2" className="flow-node" />
      {ROWS.map((y) => (
        <circle key={`n-${y}`} cx="292" cy={y} r="2" className="flow-node" />
      ))}

      {/* Ikon item di kiri. */}
      {ROWS.map((y, i) => (
        <g key={`item-${y}`} className="flow-item" style={{ animationDelay: `${i * 0.12}s` }}>
          <rect x="30" y={y - 8} width="16" height="16" rx="3" />
          <path d={`M34,${y - 2}H42M34,${y + 2}H39`} />
        </g>
      ))}

      {/* Nota yang mencetak barisnya. */}
      <path d={edge} className="flow-receipt" />
      <path d={`M${rx + 7},${ry + 9}h12`} className="flow-receipt-head" />
      <circle cx={rx + rw - 9} cy={ry + 9} r="3" className="flow-receipt-mark" />
      {printLines.map((l, i) => (
        <path
          key={l.y}
          d={`M${rx + 7},${l.y}H${l.x2}`}
          pathLength={1}
          className="flow-print"
          style={{ animationDelay: `${i * 0.09}s` }}
        />
      ))}
      <path d={`M${rx + 7},100H${rx + rw - 7}`} pathLength={1} className="flow-print is-total" />

      {/* Hasil di kanan: segel lunas, gambar PNG, printer. */}
      <g className="flow-out">
        <circle cx="308" cy="44" r="8" />
        <path d="M304.5,44.2l2.4,2.4l4.6-4.8" />
      </g>
      <g className="flow-out" style={{ animationDelay: "0.12s" }}>
        <rect x="300" y="73" width="16" height="14" rx="2" />
        <path d="M300.5,85l4.5-4.5l3,3l2.5-2.5l5,4.5" />
        <circle cx="311.5" cy="77.5" r="1.3" />
      </g>
      <g className="flow-out" style={{ animationDelay: "0.24s" }}>
        <path d="M303,111v-5h10v5" />
        <rect x="300" y="111" width="16" height="7" rx="1.5" />
        <path d="M303,116v4h10v-4" />
      </g>

      {/* Partikel biru yang berjalan di sepanjang konektor. */}
      {inPaths.map((d, i) => (
        <circle key={`pi-${d}`} r="2.2" className="flow-pulse">
          <animateMotion
            dur={CYCLE}
            begin={`${i * 0.12}s`}
            repeatCount="indefinite"
            path={d}
            keyPoints="0;1;1"
            keyTimes="0;0.38;1"
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={CYCLE}
            begin={`${i * 0.12}s`}
            repeatCount="indefinite"
            values="0;1;1;0;0"
            keyTimes="0;0.04;0.34;0.4;1"
          />
        </circle>
      ))}
      {outPaths.map((d, i) => (
        <circle key={`po-${d}`} r="2.2" className="flow-pulse">
          <animateMotion
            dur={CYCLE}
            begin={`${i * 0.12}s`}
            repeatCount="indefinite"
            path={d}
            keyPoints="0;0;1;1"
            keyTimes="0;0.55;0.86;1"
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={CYCLE}
            begin={`${i * 0.12}s`}
            repeatCount="indefinite"
            values="0;0;1;1;0;0"
            keyTimes="0;0.55;0.58;0.84;0.88;1"
          />
        </circle>
      ))}
    </svg>
  );
}

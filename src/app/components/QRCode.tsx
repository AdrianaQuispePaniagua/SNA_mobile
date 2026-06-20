import { useMemo } from "react";

function simpleHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateMatrix(data: string): boolean[][] {
  const S = 21;
  const m: boolean[][] = Array.from({ length: S }, () => Array(S).fill(false));

  const finder = (r0: number, c0: number) => {
    for (let i = 0; i < 7; i++) {
      m[r0][c0 + i] = true;
      m[r0 + 6][c0 + i] = true;
      m[r0 + i][c0] = true;
      m[r0 + i][c0 + 6] = true;
    }
    for (let r = 2; r <= 4; r++)
      for (let c = 2; c <= 4; c++)
        m[r0 + r][c0 + c] = true;
  };

  finder(0, 0);
  finder(0, 14);
  finder(14, 0);

  for (let i = 8; i < 13; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }

  const h = simpleHash(data);
  for (let r = 0; r < S; r++) {
    for (let c = 0; c < S; c++) {
      if (r < 8 && (c < 8 || c > 12)) continue;
      if (r > 12 && c < 8) continue;
      if (r === 6 || c === 6) continue;
      const v = h ^ (r * 0x4e3b + c * 0x2f7d);
      m[r][c] = ((v ^ (v >>> 13)) & 1) === 1;
    }
  }

  return m;
}

interface QRCodeProps {
  data: string;
  size?: number;
}

export function QRCode({ data, size = 200 }: QRCodeProps) {
  const matrix = useMemo(() => generateMatrix(data), [data]);
  const cell = size / 21;

  return (
    <div style={{ background: "white", padding: 8, borderRadius: 8, display: "inline-flex", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {matrix.flatMap((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

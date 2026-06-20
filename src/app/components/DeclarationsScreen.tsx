import { useState } from "react";
import { User, Declaration, Screen } from "../types";
import { QRCode } from "./QRCode";

interface DeclarationsScreenProps {
  user: User;
  declarations: Declaration[];
  onBack: () => void;
  onHome: () => void;
  onNavigate: (screen: Screen) => void;
}

const STATUS_COLOR: Record<string, string> = {
  valid: "#2E7D32", pending: "#F59E0B", error: "#D32F2F"
};
const STATUS_BG: Record<string, string> = {
  valid: "#E8F5E9", pending: "#FFFDE7", error: "#FFEBEE"
};
const STATUS_LABEL: Record<string, string> = {
  valid: "Válido", pending: "Pendiente", error: "Error"
};

function DeclarationCard({ decl }: { decl: Declaration }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{decl.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px", fontSize: 14 }}>{decl.title}</p>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 6px" }}>{decl.subtitle}</p>
              <p style={{ fontSize: 11, color: "#999", margin: "0 0 6px" }}>{decl.date}</p>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: STATUS_COLOR[decl.status],
                background: STATUS_BG[decl.status],
                padding: "3px 8px", borderRadius: 12
              }}>
                {decl.status === "valid" ? "✅" : decl.status === "pending" ? "⏳" : "❌"} {STATUS_LABEL[decl.status]}
              </span>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 8, cursor: "pointer" }} onClick={() => setShowQR(!showQR)}>
              <QRCode data={decl.qrData} size={48} />
            </div>
          </div>

          {showQR && (
            <div style={{ marginTop: 14, textAlign: "center", borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <QRCode data={decl.qrData} size={200} />
              </div>
              <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                📄 Puede imprimir este QR y presentarlo en papel en la frontera
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowQR(!showQR)} style={{
              padding: "6px 12px", borderRadius: 6, border: "1.5px solid #013171",
              color: "#013171", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600
            }}>
              {showQR ? "🔼 Ocultar QR" : "📱 Ver QR"}
            </button>
            <button style={{
              padding: "6px 12px", borderRadius: 6, border: "1.5px solid #6B7280",
              color: "#6B7280", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600
            }}>
              📄 Ver formulario
            </button>
            <button style={{
              padding: "6px 12px", borderRadius: 6, border: "1.5px solid #2E7D32",
              color: "#2E7D32", background: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600
            }}>
              ⬇️ Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeclarationsScreen({ user, declarations, onBack, onHome, onNavigate }: DeclarationsScreenProps) {
  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#013171", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>← Volver</button>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Mis declaraciones</span>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, padding: 0 }}>🏠 Inicio</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0" }}>
          {user.type === "chilean" ? `${user.name} · RUT ${user.rut}` : `${user.name} · 📘 ${user.passport}`}
        </p>
      </div>

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        {declarations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📋</p>
            <p style={{ color: "#888", fontSize: 15, fontWeight: 600 }}>No hay declaraciones registradas</p>
            <p style={{ color: "#aaa", fontSize: 13 }}>Sus declaraciones aparecerán aquí</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>
              {declarations.length} declaración{declarations.length !== 1 ? "es" : ""}
            </p>
            {declarations.map(d => <DeclarationCard key={d.id} decl={d} />)}
          </>
        )}

        <button onClick={() => onNavigate("home")} style={{
          width: "100%", padding: 13, borderRadius: 12, border: "none",
          background: "#013171", color: "white", cursor: "pointer",
          fontWeight: 700, fontSize: 15, marginTop: 8,
          boxShadow: "0 4px 12px rgba(0,51,160,0.3)"
        }}>
          ➕ Nueva declaración
        </button>
      </div>
    </div>
  );
}

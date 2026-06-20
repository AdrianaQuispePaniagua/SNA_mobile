import { User, Declaration, Screen } from "../types";
import { QRCode } from "./QRCode";

interface HomeScreenProps {
  user: User;
  declarations: Declaration[];
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

function UserBadge({ user }: { user: User }) {
  if (user.type === "chilean") {
    return <span style={{ fontSize: 13, color: "#555" }}>{user.name} · RUT {user.rut}</span>;
  }
  return (
    <span style={{ fontSize: 13, color: "#555" }}>
      {user.name} · Pasaporte {user.passport} · {user.countryFlag} {user.countryOfOrigin}
    </span>
  );
}

const ACTION_BUTTONS = [
  { icon: "🚗", label: "Pre-declarar vehículo", screen: "vehicle" as Screen },
  { icon: "👶", label: "Autorización de menor", screen: "minor" as Screen },
  { icon: "🍎", label: "Declarar alimentos", screen: "food" as Screen },
  { icon: "🐕", label: "Declarar mascota", screen: "pet" as Screen },
  { icon: "📋", label: "Mis declaraciones", screen: "declarations" as Screen },
];

const STATUS_COLORS: Record<string, string> = {
  valid: "#2E7D32",
  pending: "#F59E0B",
  error: "#D32F2F"
};
const STATUS_LABELS: Record<string, string> = {
  valid: "Válido", pending: "Pendiente", error: "Error"
};

export function HomeScreen({ user, declarations, onNavigate, onLogout }: HomeScreenProps) {
  const lastName = declarations.find(d => d.type === "vehicle");

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#013171", padding: "28px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
              ¡Hola, {user.name.split(" ")[0]}!
            </h1>
            <UserBadge user={user} />
          </div>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", borderRadius: 8, padding: "6px 12px",
            cursor: "pointer", fontSize: 12, fontWeight: 600
          }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 24 }}>
        {/* Última declaración */}
        {lastName && (
          <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>
              Última declaración
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px", fontSize: 15 }}>
                  {lastName.emoji} {lastName.title}
                </p>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>{lastName.subtitle}</p>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: STATUS_COLORS[lastName.status],
                  background: lastName.status === "valid" ? "#E8F5E9" : "#FFF8E1",
                  padding: "3px 8px", borderRadius: 12
                }}>
                  ✅ {STATUS_LABELS[lastName.status]} 30 días
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <QRCode data={lastName.qrData} size={48} />
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>
          Servicios disponibles
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACTION_BUTTONS.map(btn => (
            <button key={btn.screen} onClick={() => onNavigate(btn.screen)} style={{
              width: "100%", padding: "16px 20px", borderRadius: 12, border: "none",
              background: "#013171", color: "white",
              cursor: "pointer", fontWeight: 600, fontSize: 15,
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,51,160,0.2)", transition: "transform 0.1s"
            }}>
              <span style={{ fontSize: 22 }}>{btn.icon}</span>
              {btn.label}
              <span style={{ marginLeft: "auto", opacity: 0.7 }}>›</span>
            </button>
          ))}
        </div>

        {user.wantsPrintedQR && (
          <div style={{ background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: 12, marginTop: 20 }}>
            <p style={{ color: "#1565C0", fontSize: 13, margin: 0 }}>
              📄 Todos sus QR serán enviados por SMS y disponibles para imprimir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

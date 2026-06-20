interface ErrorCardProps {
  type: "error" | "warning";
  icon: string;
  title: string;
  message: string;
  onPrimary?: () => void;
  primaryLabel?: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

export function ErrorCard({ type, icon, title, message, onPrimary, primaryLabel, onSecondary, secondaryLabel }: ErrorCardProps) {
  const borderColor = type === "error" ? "#D32F2F" : "#FFC107";
  const titleColor = type === "error" ? "#D32F2F" : "#856404";

  return (
    <div style={{
      background: "white", borderRadius: 8,
      borderLeft: `4px solid ${borderColor}`,
      padding: 16, marginBottom: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: titleColor, margin: "0 0 4px", fontSize: 14 }}>{title}</p>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{message}</p>
          {(onPrimary || onSecondary) && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {onPrimary && (
                <button onClick={onPrimary} style={{
                  background: "#0033A0", color: "white",
                  border: "none", borderRadius: 8, padding: "7px 16px",
                  cursor: "pointer", fontSize: 13, fontWeight: 600
                }}>
                  {primaryLabel || "Sí"}
                </button>
              )}
              {onSecondary && (
                <button onClick={onSecondary} style={{
                  background: "#e0e0e0", color: "#333",
                  border: "none", borderRadius: 8, padding: "7px 16px",
                  cursor: "pointer", fontSize: 13, fontWeight: 500
                }}>
                  {secondaryLabel || "No"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

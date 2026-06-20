import { useState, CSSProperties } from "react";
import { User, Declaration } from "../types";
import { QRCode } from "./QRCode";
import { ErrorCard } from "./ErrorCard";
import { validateLicensePlate, formatDate } from "../utils";
import { upsertDeclarations } from "../../lib/declarationsService";

interface VehicleScreenProps {
  user: User;
  declarations: Declaration[];
  setDeclarations: (d: Declaration[]) => void;
  onBack: () => void;
  onHome: () => void;
}

const VEHICLE_DB: Record<string, { marca: string; modelo: string; año: number; color: string }> = {
  "AB12CD": { marca: "Toyota", modelo: "RAV4", año: 2021, color: "Blanco" },
  "BBBB12": { marca: "Chevrolet", modelo: "Spark", año: 2019, color: "Rojo" },
  "GH78IJ": { marca: "Hyundai", modelo: "Tucson", año: 2022, color: "Gris" },
  "FORD22": { marca: "Ford", modelo: "Ranger", año: 2020, color: "Negro" },
};

const BLOCKED_PLATES = ["XX99ZZ", "ROBO11"];

const UserInfo = ({ user }: { user: User }) => (
  <div style={{ background: "#E8EAF6", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
    <p style={{ fontSize: 12, color: "#3949AB", margin: 0, fontWeight: 600 }}>
      {user.type === "chilean"
        ? `👤 ${user.name} · RUT ${user.rut}`
        : `👤 ${user.name} · 📘 ${user.passport} · ${user.countryFlag} ${user.countryOfOrigin}`}
    </p>
  </div>
);

const FIELD: CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

export function VehicleScreen({ user, declarations, setDeclarations, onBack, onHome }: VehicleScreenProps) {
  const [plate, setPlate] = useState("");
  const [plateError, setPlateError] = useState("");
  const [searched, setSearched] = useState(false);
  const [vehicle, setVehicle] = useState<typeof VEHICLE_DB[string] | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualData, setManualData] = useState({ marca: "", modelo: "", año: "", chasis: "" });
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleSearch = () => {
    setPlateError(""); setSearched(false); setVehicle(null);
    setBlocked(false); setNotFound(false); setManualMode(false); setQrGenerated(false);

    if (!plate) { setPlateError("Ingrese la patente del vehículo"); return; }
    if (!validateLicensePlate(plate)) {
      setPlateError("Formato de patente incorrecto (ej: AB12CD o ABCD12)"); return;
    }

    const upperPlate = plate.toUpperCase();
    setSearched(true);

    if (BLOCKED_PLATES.includes(upperPlate)) {
      setBlocked(true); return;
    }
    const found = VEHICLE_DB[upperPlate];
    if (found) setVehicle(found);
    else setNotFound(true);
  };

  const handleGenerateQR = async () => {
    const vData = vehicle || manualData;
    const data = `ADU-VEH-${plate.toUpperCase()}-${user.rut || user.passport}-${Date.now()}`;
    setQrData(data);
    setQrGenerated(true);
    const newDecl: Declaration = {
      id: Date.now().toString(), type: "vehicle", emoji: "🚗",
      title: `${vData.marca} ${vData.modelo}`,
      subtitle: `Patente ${plate.toUpperCase()} · ${(vData as any).año || ""}`,
      date: formatDate(), status: "valid", qrData: data
    };

    const newDecls = [newDecl, ...declarations.filter(d => d.type !== "vehicle")];
    setDeclarations(newDecls);

    if (user.id) {
      try {
        await upsertDeclarations([newDecl], user.id);
      } catch (e) {
        console.error("Error saving to db:", e);
      }
    }
  };

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#013171", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>← Volver</button>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Pre-declarar vehículo</span>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, padding: 0 }}>🏠 Inicio</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0 }}>
            {user.type === "chilean" ? `${user.name} · RUT ${user.rut}` : `${user.name} · 📘 ${user.passport}`}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        <UserInfo user={user} />

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Patente del vehículo <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <input type="text" placeholder="ej: AB12CD o ABCD12"
            value={plate} onChange={e => { setPlate(e.target.value.toUpperCase()); setPlateError(""); }}
            style={{ ...FIELD, border: `1.5px solid ${plateError ? "#D32F2F" : "#D1D5DB"}`, textTransform: "uppercase" }} />
          {plateError && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{plateError}</p>}
        </div>

        <button onClick={handleSearch} style={{
          width: "100%", padding: "12px", borderRadius: 12, border: "none",
          background: "#013171", color: "white", cursor: "pointer",
          fontWeight: 600, fontSize: 15, marginBottom: 16
        }}>
          🔍 Buscar vehículo
        </button>

        {/* Blocked */}
        {blocked && (
          <ErrorCard type="error" icon="🚫"
            title="Vehículo con impedimento legal"
            message="Este vehículo no puede salir del país. Diríjase a la oficina de Aduanas más cercana para más información." />
        )}

        {/* Not found */}
        {notFound && !manualMode && (
          <ErrorCard type="warning" icon="⚠️"
            title="Patente no encontrada"
            message="No se encontró el vehículo en el sistema. ¿Desea ingresar los datos manualmente?"
            onPrimary={() => setManualMode(true)} primaryLabel="Sí, ingresar datos"
            onSecondary={() => setNotFound(false)} secondaryLabel="No" />
        )}

        {/* Manual entry for foreign vehicles */}
        {manualMode && (
          <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <p style={{ fontWeight: 700, color: "#013171", margin: "0 0 14px", fontSize: 14 }}>📝 Ingreso manual de datos</p>
            {[
              { label: "Marca", key: "marca", placeholder: "ej: Toyota" },
              { label: "Modelo", key: "modelo", placeholder: "ej: RAV4" },
              { label: "Año", key: "año", placeholder: "ej: 2021" },
              { label: "Número de chasis", key: "chasis", placeholder: "ej: 9BWZZZ377VT004251" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={(manualData as any)[f.key]}
                  onChange={e => setManualData(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ ...FIELD, border: "1.5px solid #D1D5DB" }} />
              </div>
            ))}
          </div>
        )}

        {/* Vehicle found */}
        {vehicle && (
          <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1.5px solid #C8E6C9" }}>
            <p style={{ fontWeight: 700, color: "#2E7D32", margin: "0 0 12px", fontSize: 14 }}>✅ Vehículo encontrado</p>
            {[
              { label: "Marca", value: vehicle.marca },
              { label: "Modelo", value: vehicle.modelo },
              { label: "Año", value: vehicle.año.toString() },
              { label: "Color", value: vehicle.color },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Generate QR */}
        {(vehicle || manualMode) && !blocked && (
          <button onClick={handleGenerateQR} style={{
            width: "100%", padding: "12px", borderRadius: 12, border: "none",
            background: "#2E7D32", color: "white", cursor: "pointer",
            fontWeight: 600, fontSize: 15, marginBottom: 16
          }}>
            📱 Generar QR
          </button>
        )}

        {/* QR generated */}
        {qrGenerated && (
          <div style={{ background: "white", borderRadius: 8, padding: 20, textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <QRCode data={qrData} size={200} />
            </div>
            <div style={{ background: "#E8F5E9", borderRadius: 8, padding: 10, marginBottom: 10 }}>
              <p style={{ color: "#2E7D32", fontSize: 14, fontWeight: 700, margin: 0 }}>✅ QR válido por 30 días</p>
            </div>
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
              📄 Puede imprimir este QR y presentarlo en papel en la frontera
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

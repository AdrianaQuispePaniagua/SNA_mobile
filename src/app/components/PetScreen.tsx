import { useState, CSSProperties } from "react";
import { User, Declaration } from "../types";
import { QRCode } from "./QRCode";
import { formatDate } from "../utils";

interface PetScreenProps {
  user: User;
  declarations: Declaration[];
  setDeclarations: (d: Declaration[]) => void;
  onBack: () => void;
  onHome: () => void;
}

const SPECIES = ["Perro", "Gato", "Ave", "Conejo", "Pez", "Reptil", "Otro"];

const FIELD: CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

export function PetScreen({ user, declarations, setDeclarations, onBack, onHome }: PetScreenProps) {
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [petName, setPetName] = useState("");
  const [microchip, setMicrochip] = useState("");
  const [vaccinated, setVaccinated] = useState(false);
  const [healthCert, setHealthCert] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [qrData, setQrData] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!species) e.species = "Seleccione la especie";
    if (!petName.trim()) e.petName = "El nombre de la mascota es obligatorio";
    if (!microchip.trim()) e.microchip = "El número de microchip es obligatorio";
    if (!vaccinated) e.vaccinated = "Debe confirmar que la mascota está vacunada";
    if (!healthCert) e.healthCert = "Debe confirmar el certificado de salud";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const data = `ADU-PET-${user.rut || user.passport}-${Date.now()}`;
    setQrData(data);
    setConfirmed(true);
    const newDecl: Declaration = {
      id: Date.now().toString(), type: "pet", emoji: "🐾",
      title: `${petName} (${species}${breed ? " " + breed : ""})`,
      subtitle: `Microchip: ${microchip}`,
      date: formatDate(), status: "valid", qrData: data
    };
    setDeclarations([newDecl, ...declarations]);
  };

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#013171", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>← Volver</button>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Declarar mascota</span>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, padding: 0 }}>🏠 Inicio</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0" }}>
          {user.type === "chilean" ? `${user.name} · RUT ${user.rut}` : `${user.name} · 📘 ${user.passport}`}
        </p>
      </div>

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        <div style={{ background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: 12, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#1565C0", margin: 0 }}>
            🐾 Para ingresar mascotas al país se requiere microchip, vacunas al día y certificado veterinario.
          </p>
        </div>

        {!confirmed && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Especie <span style={{ color: "#D32F2F" }}>*</span>
              </label>
              <select value={species} onChange={e => setSpecies(e.target.value)}
                style={{ ...FIELD, border: `1.5px solid ${errors.species ? "#D32F2F" : "#D1D5DB"}` }}>
                <option value="">Seleccione la especie...</option>
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.species && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.species}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Raza <span style={{ color: "#6B7280", fontWeight: 400 }}>(opcional)</span>
              </label>
              <input type="text" placeholder="ej: Golden Retriever" value={breed}
                onChange={e => setBreed(e.target.value)}
                style={{ ...FIELD, border: "1.5px solid #D1D5DB" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Nombre de la mascota <span style={{ color: "#D32F2F" }}>*</span>
              </label>
              <input type="text" placeholder="ej: Max" value={petName}
                onChange={e => setPetName(e.target.value)}
                style={{ ...FIELD, border: `1.5px solid ${errors.petName ? "#D32F2F" : "#D1D5DB"}` }} />
              {errors.petName && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.petName}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Número de microchip <span style={{ color: "#D32F2F" }}>*</span>
              </label>
              <input type="text" placeholder="ej: 985112345678901" value={microchip}
                onChange={e => setMicrochip(e.target.value)}
                style={{ ...FIELD, border: `1.5px solid ${errors.microchip ? "#D32F2F" : "#D1D5DB"}` }} />
              {errors.microchip && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.microchip}</p>}
            </div>

            {/* Checkboxes */}
            <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <input type="checkbox" id="vacc" checked={vaccinated}
                  onChange={e => setVaccinated(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#013171" }} />
                <label htmlFor="vacc" style={{ fontSize: 13, color: "#444", cursor: "pointer", lineHeight: 1.4 }}>
                  💉 La mascota tiene todas sus vacunas al día (antirrábica obligatoria)
                </label>
              </div>
              {errors.vaccinated && <p style={{ color: "#D32F2F", fontSize: 12, margin: "-8px 0 10px 26px" }}>{errors.vaccinated}</p>}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input type="checkbox" id="health" checked={healthCert}
                  onChange={e => setHealthCert(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#013171" }} />
                <label htmlFor="health" style={{ fontSize: 13, color: "#444", cursor: "pointer", lineHeight: 1.4 }}>
                  🩺 Poseo certificado veterinario de salud (no mayor a 10 días)
                </label>
              </div>
              {errors.healthCert && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0 26px" }}>{errors.healthCert}</p>}
            </div>

            <button onClick={handleConfirm} style={{
              width: "100%", padding: 13, borderRadius: 12, border: "none",
              background: "#013171", color: "white", cursor: "pointer",
              fontWeight: 700, fontSize: 15, boxShadow: "0 4px 12px rgba(0,51,160,0.3)"
            }}>
              ✅ Confirmar declaración
            </button>
          </>
        )}

        {confirmed && (
          <div style={{ background: "white", borderRadius: 8, padding: 20, textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <QRCode data={qrData} size={150} />
            </div>
            <div style={{ background: "#E8F5E9", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <p style={{ color: "#2E7D32", fontSize: 14, fontWeight: 700, margin: 0 }}>
                ✅ Declaración registrada · {petName} ({species})
              </p>
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

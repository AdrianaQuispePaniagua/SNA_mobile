import { useState, CSSProperties } from "react";
import { User, Declaration } from "../types";
import { QRCode } from "./QRCode";
import { ErrorCard } from "./ErrorCard";
import { validateRUT, validatePassport, formatDate } from "../utils";
import { upsertDeclarations } from "../../lib/declarationsService";

interface MinorAuthScreenProps {
  user: User;
  declarations: Declaration[];
  setDeclarations: (d: Declaration[]) => void;
  onBack: () => void;
  onHome: () => void;
}

type DocIdType = "rut" | "passport";
type DocType = "notarial" | "judicial";

const FIELD: CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

const LBL: CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#333",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5
};

export function MinorAuthScreen({ user, declarations, setDeclarations, onBack, onHome }: MinorAuthScreenProps) {
  const [docIdType, setDocIdType] = useState<DocIdType>("rut");
  const [docId, setDocId] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [docType, setDocType] = useState<DocType>("notarial");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [validationResult, setValidationResult] = useState<"" | "valid" | "invalid">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrData, setQrData] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (docIdType === "rut") {
      if (!docId) e.docId = "El RUT del menor es obligatorio";
      else if (!validateRUT(docId)) e.docId = "Formato de RUT inválido (ej: 12.345.678-9)";
    } else {
      if (!docId) e.docId = "El número de pasaporte es obligatorio";
      else if (!validatePassport(docId)) e.docId = "Formato de pasaporte inválido (ej: AB123456)";
    }
    if (!nombre.trim()) e.nombre = "El nombre completo es obligatorio";
    if (!fechaNac) e.fechaNac = "La fecha de nacimiento es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleValidate = () => {
    if (!validate()) return;
    if (!fileUploaded) {
      setErrors(prev => ({ ...prev, file: "Debe subir el documento primero" }));
      return;
    }

    const isValid = !docId.includes("99") && nombre.trim().length > 3;

    setTimeout(async () => {
      setValidationResult(isValid ? "valid" : "invalid");
      if (isValid) {
        const data = `ADU-MIN-${docId.replace(/[^A-Za-z0-9]/g, "")}-${Date.now()}`;
        setQrData(data);
        const newDecl: Declaration = {
          id: Date.now().toString(), type: "minor", emoji: "👶",
          title: nombre,
          subtitle: `Auth. ${docType === "notarial" ? "notarial" : "judicial"} · ${docIdType === "rut" ? "RUT" : "Pasaporte"}: ${docId}`,
          date: formatDate(), status: "pending", qrData: data
        };
        setDeclarations([newDecl, ...declarations]);

        if (user.id) {
          try {
            await upsertDeclarations([newDecl], user.id);
          } catch (e) {
            console.error("Error saving to db:", e);
          }
        }
      }
    }, 600);
  };

  const inp = (err?: string): CSSProperties => ({ ...FIELD, border: `1.5px solid ${err ? "#D32F2F" : "#D1D5DB"}` });

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#013171", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>
            ← Volver
          </button>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Autorización de menor</span>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, padding: 0 }}>
            🏠 Inicio
          </button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0" }}>
          {user.type === "chilean" ? `${user.name} · RUT ${user.rut}` : `${user.name} · 📘 ${user.passport}`}
        </p>
      </div>

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        <div style={{ background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 8, padding: 12, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#E65100", margin: 0 }}>
            ⚠️ Para viajar con un menor de 18 años sin ambos padres, se requiere autorización notarial o judicial.
          </p>
        </div>

        {/* Document ID type selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={LBL}>Tipo de identificación del menor</label>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { val: "rut" as DocIdType, label: "🪪 RUT (Chileno)" },
              { val: "passport" as DocIdType, label: "📘 Pasaporte (Extranjero)" },
            ]).map(opt => (
              <button key={opt.val} onClick={() => { setDocIdType(opt.val); setDocId(""); setErrors(p => ({ ...p, docId: "" })); }}
                style={{
                  flex: 1, padding: "10px 6px", borderRadius: 8, border: "none",
                  background: docIdType === opt.val ? "#013171" : "#E5E7EB",
                  color: docIdType === opt.val ? "white" : "#555",
                  cursor: "pointer", fontWeight: 600, fontSize: 12
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document ID field — label changes based on type */}
        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>
            {docIdType === "rut" ? "RUT del menor" : "N° de pasaporte del menor"}{" "}
            <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <input
            type="text"
            placeholder={docIdType === "rut" ? "12.345.678-9" : "ej: AB123456"}
            value={docId}
            onChange={e => { setDocId(e.target.value); setErrors(p => ({ ...p, docId: "" })); }}
            style={inp(errors.docId)}
          />
          {errors.docId && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.docId}</p>}
          {docIdType === "rut" && (
            <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>Formato requerido: XX.XXX.XXX-X</p>
          )}
          {docIdType === "passport" && (
            <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>Letras y números (ej: AB123456)</p>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Nombre completo <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="text" placeholder="Nombre completo del menor" value={nombre}
            onChange={e => { setNombre(e.target.value); setErrors(p => ({ ...p, nombre: "" })); }}
            style={inp(errors.nombre)} />
          {errors.nombre && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.nombre}</p>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={LBL}>Fecha de nacimiento <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="date" value={fechaNac}
            onChange={e => { setFechaNac(e.target.value); setErrors(p => ({ ...p, fechaNac: "" })); }}
            style={inp(errors.fechaNac)} />
          {errors.fechaNac && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.fechaNac}</p>}
        </div>

        {/* Document type toggle */}
        <div style={{ marginBottom: 20 }}>
          <label style={LBL}>Tipo de documento</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["notarial", "judicial"] as DocType[]).map(t => (
              <button key={t} onClick={() => setDocType(t)} style={{
                flex: 1, padding: "11px 0", borderRadius: 8, border: "none",
                background: docType === t ? "#013171" : "#E5E7EB",
                color: docType === t ? "white" : "#555",
                cursor: "pointer", fontWeight: 600, fontSize: 14
              }}>
                {t === "notarial" ? "⚖️ Notarial" : "🏛️ Judicial"}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => { setFileUploaded(true); setErrors(p => ({ ...p, file: "" })); }} style={{
            width: "100%", padding: "12px", borderRadius: 12,
            border: `2px dashed ${errors.file ? "#D32F2F" : "#9CA3AF"}`,
            background: fileUploaded ? "#F0FDF4" : "white",
            color: fileUploaded ? "#2E7D32" : "#555",
            cursor: "pointer", fontWeight: 600, fontSize: 14
          }}>
            {fileUploaded ? "✅ Documento PDF cargado" : "📎 Subir documento PDF"}
          </button>
          {errors.file && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.file}</p>}
        </div>

        <button onClick={handleValidate} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: "#013171", color: "white", cursor: "pointer",
          fontWeight: 700, fontSize: 15, marginBottom: 16,
          boxShadow: "0 4px 12px rgba(1,49,113,0.3)"
        }}>
          🛡️ Validar con PDI
        </button>

        {/* Validation results */}
        {validationResult === "invalid" && (
          <ErrorCard type="error" icon="❌"
            title="Documento inválido según PDI"
            message="El documento no pudo ser validado. Debe presentarse en oficina de PDI con los documentos originales." />
        )}

        {validationResult === "valid" && (
          <div style={{ background: "white", borderRadius: 8, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            {/* Info banner */}
            <div style={{
              background: "#013171", borderRadius: 8, padding: "12px 16px",
              marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10
            }}>
              <span style={{ fontSize: 18 }}>ℹ️</span>
              <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                Autorización de menor registrada. Pendiente validación con PDI.
              </p>
            </div>

            {/* Success badge */}
            <div style={{ background: "#E8F5E9", borderRadius: 8, padding: 10, marginBottom: 14, textAlign: "center" }}>
              <p style={{ color: "#2E7D32", fontSize: 13, fontWeight: 700, margin: 0 }}>
                ✅ Documento válido — Confirmado por PDI
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <QRCode data={qrData} size={150} />
            </div>
            <p style={{ fontSize: 12, color: "#666", margin: 0, textAlign: "center" }}>
              📄 Puede imprimir este QR y presentarlo en papel en la frontera
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

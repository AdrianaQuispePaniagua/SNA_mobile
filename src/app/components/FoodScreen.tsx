import { useState, CSSProperties } from "react";
import { User, Declaration } from "../types";
import { QRCode } from "./QRCode";
import { ErrorCard } from "./ErrorCard";
import { isProhibitedProduct, formatDate } from "../utils";

interface FoodScreenProps {
  user: User;
  declarations: Declaration[];
  setDeclarations: (d: Declaration[]) => void;
  onBack: () => void;
  onHome: () => void;
}

interface FoodItem {
  id: string;
  tipo: string;
  pais: string;
  cantidad: string;
  prohibited: boolean;
}

const TIPOS = ["Frutas", "Carnes", "Lácteos", "Vegetales", "Granos", "Mariscos", "Embutidos", "Otro"];

const FIELD: CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

export function FoodScreen({ user, declarations, setDeclarations, onBack, onHome }: FoodScreenProps) {
  const [hasFood, setHasFood] = useState<boolean | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [currentTipo, setCurrentTipo] = useState("");
  const [currentPais, setCurrentPais] = useState("");
  const [currentCantidad, setCurrentCantidad] = useState("");
  const [addError, setAddError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleAddProduct = () => {
    setAddError("");
    if (!currentTipo || !currentPais || !currentCantidad) {
      setAddError("Complete todos los campos del producto"); return;
    }
    const prohibited = isProhibitedProduct(currentTipo, currentPais + " " + currentCantidad);
    const newItem: FoodItem = {
      id: Date.now().toString(),
      tipo: currentTipo, pais: currentPais,
      cantidad: currentCantidad, prohibited
    };
    setItems(prev => [...prev, newItem]);
    setCurrentTipo(""); setCurrentPais(""); setCurrentCantidad("");
  };

  const handleRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleConfirm = () => {
    const data = `ADU-ALI-${user.rut || user.passport}-${Date.now()}`;
    setQrData(data);
    setConfirmed(true);
    const newDecl: Declaration = {
      id: Date.now().toString(), type: "food", emoji: "🍎",
      title: "Declaración de alimentos",
      subtitle: `${items.length} producto${items.length !== 1 ? "s" : ""} declarado${items.length !== 1 ? "s" : ""}`,
      date: formatDate(), status: "valid", qrData: data
    };
    setDeclarations([newDecl, ...declarations]);
  };

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#013171", padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}>← Volver</button>
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Declarar alimentos</span>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, padding: 0 }}>🏠 Inicio</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0" }}>
          {user.type === "chilean" ? `${user.name} · RUT ${user.rut}` : `${user.name} · 📘 ${user.passport}`}
        </p>
      </div>

      <div style={{ flex: 1, padding: "20px 24px 32px" }}>
        {/* Main question */}
        <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
          <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 15, margin: "0 0 14px" }}>
            ¿Porta alimentos de origen animal o vegetal?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setHasFood(true); setConfirmed(false); }} style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: hasFood === true ? "#013171" : "#E5E7EB",
              color: hasFood === true ? "white" : "#555",
              cursor: "pointer", fontWeight: 600, fontSize: 15
            }}>Sí</button>
            <button onClick={() => { setHasFood(false); setItems([]); setConfirmed(false); }} style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: hasFood === false ? "#6B7280" : "#E5E7EB",
              color: hasFood === false ? "white" : "#555",
              cursor: "pointer", fontWeight: 600, fontSize: 15
            }}>No</button>
          </div>
        </div>

        {/* No food confirmation */}
        {hasFood === false && !confirmed && (
          <div>
            <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <p style={{ color: "#2E7D32", fontSize: 13, margin: 0 }}>
                ✅ Ha declarado que no porta alimentos de origen animal o vegetal.
              </p>
            </div>
            <button onClick={handleConfirm} style={{
              width: "100%", padding: 13, borderRadius: 12, border: "none",
              background: "#013171", color: "white", cursor: "pointer",
              fontWeight: 700, fontSize: 15
            }}>
              Confirmar declaración
            </button>
          </div>
        )}

        {/* Food form */}
        {hasFood === true && !confirmed && (
          <div>
            <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
              <p style={{ fontWeight: 700, color: "#013171", margin: "0 0 14px", fontSize: 14 }}>➕ Agregar producto</p>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>Tipo de alimento</label>
                <select value={currentTipo} onChange={e => setCurrentTipo(e.target.value)}
                  style={{ ...FIELD, border: "1.5px solid #D1D5DB" }}>
                  <option value="">Seleccione tipo...</option>
                  {TIPOS.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>País de origen</label>
                <input type="text" placeholder="ej: Chile, Argentina..." value={currentPais}
                  onChange={e => setCurrentPais(e.target.value)}
                  style={{ ...FIELD, border: "1.5px solid #D1D5DB" }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>Cantidad aproximada</label>
                <input type="text" placeholder="ej: 2 kg, 3 unidades" value={currentCantidad}
                  onChange={e => setCurrentCantidad(e.target.value)}
                  style={{ ...FIELD, border: "1.5px solid #D1D5DB" }} />
              </div>

              {addError && <p style={{ color: "#D32F2F", fontSize: 12, margin: "0 0 10px" }}>{addError}</p>}

              <button onClick={handleAddProduct} style={{
                width: "100%", padding: 11, borderRadius: 10, border: "none",
                background: "#E3F2FD", color: "#1565C0",
                cursor: "pointer", fontWeight: 600, fontSize: 14
              }}>
                ➕ Agregar producto
              </button>
            </div>

            {/* Product list */}
            {items.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>
                  Productos declarados ({items.length})
                </p>
                {items.map(item => (
                  <div key={item.id}>
                    {item.prohibited && (
                      <ErrorCard type="error" icon="🚫"
                        title="Producto prohibido por SAG"
                        message={`${item.tipo} fresco de ${item.pais} — Será decomisado en frontera.`} />
                    )}
                    <div style={{
                      background: "white", borderRadius: 8, padding: 12, marginBottom: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      borderLeft: item.prohibited ? "4px solid #D32F2F" : "4px solid #2E7D32"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "#1a1a1a", margin: "0 0 2px", fontSize: 14 }}>
                            🍽️ {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                          </p>
                          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
                            {item.pais} · {item.cantidad}
                          </p>
                        </div>
                        <button onClick={() => handleRemove(item.id)} style={{
                          background: "none", border: "none", color: "#D32F2F",
                          cursor: "pointer", fontSize: 18, padding: "0 4px"
                        }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && !items.some(i => i.prohibited) && (
              <button onClick={handleConfirm} style={{
                width: "100%", padding: 13, borderRadius: 12, border: "none",
                background: "#013171", color: "white", cursor: "pointer",
                fontWeight: 700, fontSize: 15
              }}>
                ✅ Confirmar declaración
              </button>
            )}
          </div>
        )}

        {/* QR confirmed */}
        {confirmed && (
          <div style={{ background: "white", borderRadius: 8, padding: 20, textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <QRCode data={qrData} size={120} />
            </div>
            <div style={{ background: "#E8F5E9", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <p style={{ color: "#2E7D32", fontSize: 14, fontWeight: 700, margin: 0 }}>✅ Declaración registrada</p>
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

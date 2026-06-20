import { useState, CSSProperties } from "react";
import { toast } from "sonner";
import { ChileShield } from "./ChileShield";
import { User, UserType } from "../types";
import { COUNTRIES, COUNTRY_FLAGS, validateRUT, validatePassport } from "../utils";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
}

const FIELD: CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

function calculateAge(birthDateStr: string): number {
  const today = new Date();
  const dob = new Date(birthDateStr);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [userType, setUserType] = useState<UserType>("chilean");
  const [rut, setRut] = useState("12.345.678-9");
  const [passport, setPassport] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [birthDate, setBirthDate] = useState("");
  const [wantsPrintedQR, setWantsPrintedQR] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrSmsMsg, setQrSmsMsg] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (userType === "chilean") {
      if (!rut) e.rut = "El RUT es obligatorio";
      else if (!validateRUT(rut)) e.rut = "Formato de RUT inválido (ej: 12.345.678-9)";
    } else {
      if (!passport) e.passport = "El pasaporte es obligatorio";
      else if (!validatePassport(passport)) e.passport = "Formato inválido (ej: AB123456)";
      if (!country) e.country = "Seleccione su país de origen";
    }
    if (!password) e.password = "La contraseña es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    if (birthDate) {
      const age = calculateAge(birthDate);
      if (age < 18) {
        toast("Acceso denegado. Debes ser mayor de 18 años.", {
          style: { background: "#9a2f2f", color: "white" },
          duration: 3000,
        });
        setErrors(prev => ({ ...prev, birthDate: "Acceso denegado: debes tener al menos 18 años" }));
        return;
      }
    }

    if (wantsPrintedQR) setQrSmsMsg(true);

    try {
      const payload = {
        userType,
        rut: userType === 'chilean' ? rut : undefined,
        passport: userType === 'foreign' ? passport : undefined,
        password
      };

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }

      const userData = await response.json();
      onLogin(userData as User);
    } catch (error) {
      console.error('Login error:', error);
      toast(error instanceof Error ? error.message : 'Credenciales inválidas', {
        style: { background: "#9a2f2f", color: "white" },
        duration: 3000,
      });
    }
  };

  const switchType = (t: UserType) => { setUserType(t); setErrors({}); };
  const inp = (err?: string): CSSProperties => ({ ...FIELD, border: `1.5px solid ${err ? "#D32F2F" : "#D1D5DB"}` });

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#013171", padding: "36px 24px 28px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <ChileShield />
        </div>
        <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Aduanas Chile</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0" }}>Servicio Nacional de Aduanas</p>
      </div>

      <div style={{ flex: 1, padding: "24px 24px 32px" }}>
        {/* Type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["chilean", "foreign"] as UserType[]).map(t => (
            <button key={t} onClick={() => switchType(t)} style={{
              flex: 1, padding: "11px 0", borderRadius: 20, border: "none",
              background: userType === t ? "#013171" : "#E5E7EB",
              color: userType === t ? "white" : "#555",
              cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s"
            }}>
              {t === "chilean" ? "📋 Chileno" : "🌎 Extranjero"}
            </button>
          ))}
        </div>

        {userType === "chilean" ? (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              RUT <span style={{ color: "#D32F2F" }}>*</span>
            </label>
            <input type="text" placeholder="12.345.678-9" value={rut}
              onChange={e => setRut(e.target.value)} style={inp(errors.rut)} />
            {errors.rut && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.rut}</p>}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                📘 Pasaporte <span style={{ color: "#D32F2F" }}>*</span>
              </label>
              <input type="text" placeholder="ej: AB123456" value={passport}
                onChange={e => setPassport(e.target.value)} style={inp(errors.passport)} />
              {errors.passport && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.passport}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                País de origen <span style={{ color: "#D32F2F" }}>*</span>
              </label>
              <select value={country} onChange={e => setCountry(e.target.value)} style={inp(errors.country)}>
                <option value="">Seleccione su país...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{(COUNTRY_FLAGS[c] || "🌎") + " " + c}</option>)}
              </select>
              {errors.country && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.country}</p>}
            </div>
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Contraseña <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)} style={inp(errors.password)} />
          {errors.password && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.password}</p>}
        </div>

        {/* DOB field for age verification */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Fecha de nacimiento{" "}
            <span style={{ color: "#888", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>
              (verificación de edad)
            </span>
          </label>
          <input type="date" value={birthDate}
            onChange={e => { setBirthDate(e.target.value); setErrors(p => ({ ...p, birthDate: "" })); }}
            style={inp(errors.birthDate)} />
          {errors.birthDate && (
            <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.birthDate}</p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="pqr" checked={wantsPrintedQR}
            onChange={e => { setWantsPrintedQR(e.target.checked); setQrSmsMsg(false); }}
            style={{ marginTop: 2, cursor: "pointer", accentColor: "#013171", width: 16, height: 16 }} />
          <label htmlFor="pqr" style={{ fontSize: 13, color: "#555", cursor: "pointer", lineHeight: 1.4 }}>
            📄 Quiero mi QR impreso (no tengo smartphone)
          </label>
        </div>

        {wantsPrintedQR && qrSmsMsg && (
          <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ color: "#2E7D32", fontSize: 13, margin: 0 }}>
              ✅ Su QR será enviado por SMS. También puede descargarlo e imprimirlo.
            </p>
          </div>
        )}

        <button onClick={handleLogin} style={{
          width: "100%", padding: 14, borderRadius: 12, border: "none",
          background: "#013171", color: "white",
          cursor: "pointer", fontWeight: 700, fontSize: 16, marginBottom: 16,
          boxShadow: "0 4px 12px rgba(1,49,113,0.3)"
        }}>
          Iniciar sesión
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "#555", margin: 0 }}>
          ¿No tiene cuenta?{" "}
          <button onClick={onRegister} style={{
            background: "none", border: "none", color: "#013171",
            cursor: "pointer", fontWeight: 700, fontSize: 14, padding: 0
          }}>
            Regístrese
          </button>
        </p>
      </div>
    </div>
  );
}

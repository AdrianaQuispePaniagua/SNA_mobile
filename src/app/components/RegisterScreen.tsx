import { useState, CSSProperties } from "react";
import { toast } from "sonner";
import { ChileShield } from "./ChileShield";
import { User, UserType } from "../types";
import { COUNTRIES, COUNTRY_FLAGS, validateRUT, validatePassport, validateEmail } from "../utils";

interface RegisterScreenProps {
  onRegister: (user: User) => void;
  onLogin: () => void;
}

const FIELD: CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
  background: "white", fontFamily: "inherit"
};

const LBL: CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#333",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5
};

function calculateAge(birthDateStr: string): number {
  const today = new Date();
  const dob = new Date(birthDateStr);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function RegisterScreen({ onRegister, onLogin }: RegisterScreenProps) {
  const [userType, setUserType] = useState<UserType>("chilean");
  const [rut, setRut] = useState("");
  const [passport, setPassport] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasChileanRut, setHasChileanRut] = useState(false);
  const [chileanRutForeign, setChileanRutForeign] = useState("");
  const [wantsPrintedQR, setWantsPrintedQR] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (userType === "chilean") {
      if (!rut) e.rut = "El RUT es obligatorio";
      else if (!validateRUT(rut)) e.rut = "Formato inválido (ej: 12.345.678-9)";
    } else {
      if (!passport) e.passport = "El pasaporte es obligatorio";
      else if (!validatePassport(passport)) e.passport = "Formato inválido (ej: AB123456)";
      if (!country) e.country = "Seleccione su país de origen";
    }
    if (!name.trim()) e.name = "El nombre es obligatorio";
    if (email && !validateEmail(email)) e.email = "Formato de email inválido";
    if (!phone.trim()) e.phone = "El teléfono es obligatorio";
    if (!birthDate) e.birthDate = "La fecha de nacimiento es obligatoria";
    if (!password) e.password = "La contraseña es obligatoria";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    if (password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    if (!acceptTerms) e.terms = "Debe aceptar los términos y condiciones";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    if (birthDate && calculateAge(birthDate) < 18) {
      toast("Debes ser mayor de 18 años para registrarte", {
        style: { background: "#9a2f2f", color: "white" },
        duration: 3000,
      });
      setErrors(prev => ({ ...prev, birthDate: "Debes tener al menos 18 años" }));
      return;
    }

    try {
      const payload = {
        type: userType,
        rut: userType === "chilean" ? rut : (hasChileanRut ? chileanRutForeign : undefined),
        passport: userType === "foreign" ? passport : undefined,
        countryOfOrigin: country,
        countryFlag: COUNTRY_FLAGS[country] || "🌎",
        name,
        email,
        phone,
        birthDate,
        password,
        wantsPrintedQR
      };

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const userData = await response.json();

      const firstName = name.trim().split(" ")[0];
      toast(`¡Cuenta creada exitosamente! Bienvenido, ${firstName}`, {
        style: { background: "#2f6b40", color: "white" },
        duration: 3000,
      });

      setTimeout(() => {
        onRegister(userData as User);
      }, 1200);
    } catch (error) {
      console.error('Registration error:', error);
      toast(error instanceof Error ? error.message : 'Error al registrarse', {
        style: { background: "#9a2f2f", color: "white" },
        duration: 3000,
      });
    }
  };

  const switchType = (t: UserType) => { setUserType(t); setErrors({}); };
  const inp = (err?: string): CSSProperties => ({ ...FIELD, border: `1.5px solid ${err ? "#D32F2F" : "#D1D5DB"}` });

  return (
    <div style={{ minHeight: "100%", background: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#013171", padding: "28px 24px 22px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <ChileShield />
        </div>
        <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0 }}>Crear cuenta</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0" }}>Aduanas Chile</p>
      </div>

      <div style={{ flex: 1, padding: "24px 24px 32px" }}>
        {/* Type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["chilean", "foreign"] as UserType[]).map(t => (
            <button key={t} onClick={() => switchType(t)} style={{
              flex: 1, padding: "11px 0", borderRadius: 20, border: "none",
              background: userType === t ? "#013171" : "#E5E7EB",
              color: userType === t ? "white" : "#555",
              cursor: "pointer", fontWeight: 600, fontSize: 14
            }}>
              {t === "chilean" ? "📋 Chileno" : "🌎 Extranjero"}
            </button>
          ))}
        </div>

        {userType === "chilean" && (
          <div style={{ marginBottom: 14 }}>
            <label style={LBL}>RUT <span style={{ color: "#D32F2F" }}>*</span></label>
            <input type="text" placeholder="12.345.678-9" value={rut}
              onChange={e => setRut(e.target.value)} style={inp(errors.rut)} />
            {errors.rut && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.rut}</p>}
          </div>
        )}

        {userType === "foreign" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={LBL}>📘 Pasaporte <span style={{ color: "#D32F2F" }}>*</span></label>
              <input type="text" placeholder="ej: AB123456" value={passport}
                onChange={e => setPassport(e.target.value)} style={inp(errors.passport)} />
              {errors.passport && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.passport}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={LBL}>País de origen <span style={{ color: "#D32F2F" }}>*</span></label>
              <select value={country} onChange={e => setCountry(e.target.value)} style={inp(errors.country)}>
                <option value="">Seleccione su país...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{(COUNTRY_FLAGS[c] || "🌎") + " " + c}</option>)}
              </select>
              {errors.country && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.country}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, background: "white", padding: 12, borderRadius: 8, border: "1.5px solid #D1D5DB" }}>
              <input type="checkbox" id="hasRut" checked={hasChileanRut}
                onChange={e => setHasChileanRut(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#013171" }} />
              <label htmlFor="hasRut" style={{ fontSize: 13, color: "#444", cursor: "pointer" }}>
                ¿Tiene RUT chileno? (residente)
              </label>
            </div>
            {hasChileanRut && (
              <div style={{ marginBottom: 14 }}>
                <label style={LBL}>RUT chileno</label>
                <input type="text" placeholder="12.345.678-9" value={chileanRutForeign}
                  onChange={e => setChileanRutForeign(e.target.value)} style={inp()} />
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Nombre completo <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="text" placeholder="Ingrese su nombre completo" value={name}
            onChange={e => setName(e.target.value)} style={inp(errors.name)} />
          {errors.name && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>
            Fecha de nacimiento <span style={{ color: "#D32F2F" }}>*</span>
            <span style={{ color: "#888", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4, fontSize: 11 }}>
              (se requiere ser mayor de 18 años)
            </span>
          </label>
          <input type="date" value={birthDate}
            onChange={e => { setBirthDate(e.target.value); setErrors(p => ({ ...p, birthDate: "" })); }}
            style={inp(errors.birthDate)} />
          {errors.birthDate && (
            <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.birthDate}</p>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Email <span style={{ color: "#6B7280", fontWeight: 400, textTransform: "none", fontSize: 11 }}>(opcional)</span></label>
          <input type="email" placeholder="correo@ejemplo.com" value={email}
            onChange={e => setEmail(e.target.value)} style={inp(errors.email)} />
          {errors.email && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Teléfono <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="tel" placeholder="+56 9 1234 5678" value={phone}
            onChange={e => setPhone(e.target.value)} style={inp(errors.phone)} />
          {errors.phone && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.phone}</p>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Contraseña <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="password" placeholder="Mínimo 6 caracteres" value={password}
            onChange={e => setPassword(e.target.value)} style={inp(errors.password)} />
          {errors.password && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.password}</p>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={LBL}>Confirmar contraseña <span style={{ color: "#D32F2F" }}>*</span></label>
          <input type="password" placeholder="Repita su contraseña" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} style={inp(errors.confirmPassword)} />
          {errors.confirmPassword && <p style={{ color: "#D32F2F", fontSize: 12, margin: "4px 0 0" }}>{errors.confirmPassword}</p>}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <input type="checkbox" id="pqr2" checked={wantsPrintedQR}
            onChange={e => setWantsPrintedQR(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, accentColor: "#013171" }} />
          <label htmlFor="pqr2" style={{ fontSize: 13, color: "#555", cursor: "pointer" }}>
            📄 Quiero mi QR impreso (no tengo smartphone)
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <input type="checkbox" id="terms" checked={acceptTerms}
            onChange={e => setAcceptTerms(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, accentColor: "#013171" }} />
          <label htmlFor="terms" style={{ fontSize: 13, color: "#555", cursor: "pointer", lineHeight: 1.4 }}>
            Acepto los{" "}
            <span style={{ color: "#013171", fontWeight: 600 }}>términos y condiciones</span>{" "}
            del Servicio Nacional de Aduanas
          </label>
        </div>
        {errors.terms && <p style={{ color: "#D32F2F", fontSize: 12, margin: "0 0 12px" }}>{errors.terms}</p>}

        <div style={{ height: 12 }} />

        <button onClick={handleRegister} style={{
          width: "100%", padding: 14, borderRadius: 12, border: "none",
          background: "#013171", color: "white",
          cursor: "pointer", fontWeight: 700, fontSize: 16, marginBottom: 16,
          boxShadow: "0 4px 12px rgba(1,49,113,0.3)"
        }}>
          Registrarse
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "#555", margin: 0 }}>
          ¿Ya tiene cuenta?{" "}
          <button onClick={onLogin} style={{
            background: "none", border: "none", color: "#013171",
            cursor: "pointer", fontWeight: 700, fontSize: 14, padding: 0
          }}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}

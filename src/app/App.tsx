import { useState } from "react";
import { Toaster } from "sonner";
import { Screen, User, Declaration } from "./types";
import { fetchDeclarations, upsertDeclarations } from "../lib/declarationsService";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { HomeScreen } from "./components/HomeScreen";
import { VehicleScreen } from "./components/VehicleScreen";
import { MinorAuthScreen } from "./components/MinorAuthScreen";
import { FoodScreen } from "./components/FoodScreen";
import { PetScreen } from "./components/PetScreen";
import { DeclarationsScreen } from "./components/DeclarationsScreen";

const SEED_DECLARATIONS: Declaration[] = [
  { id: "seed-1", type: "vehicle", emoji: "🚗", title: "Toyota RAV4", subtitle: "Patente AB12CD · 2021", date: "15/05/2025", status: "valid", qrData: "ADU-VEH-AB12CD-1234567890" },
  { id: "seed-2", type: "food", emoji: "🍎", title: "Declaración de alimentos", subtitle: "3 productos declarados", date: "15/05/2025", status: "valid", qrData: "ADU-ALI-12345678-1234567891" },
  { id: "seed-3", type: "minor", emoji: "👶", title: "Martín Palma García", subtitle: "Autorización notarial", date: "10/05/2025", status: "pending", qrData: "ADU-MIN-11223344-1234567892" },
  { id: "seed-4", type: "pet", emoji: "🐾", title: "Max (Perro Golden Retriever)", subtitle: "Microchip: 985112345678901", date: "08/05/2025", status: "valid", qrData: "ADU-PET-12345678-1234567893" },
];

async function loadDeclarations(userId: number): Promise<Declaration[]> {
  try {
    const remote = await fetchDeclarations(userId);
    if (remote.length > 0) return remote;
    // Table is empty on first run — seed it
    await upsertDeclarations(SEED_DECLARATIONS, userId);
    return SEED_DECLARATIONS;
  } catch {
    // Fall back to local data if server is unavailable
    return SEED_DECLARATIONS;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);

  const handleLogin = async (u: User) => {
    setUser(u);
    setScreen("home");
    if (u.id) {
      const decls = await loadDeclarations(u.id);
      setDeclarations(decls);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDeclarations([]);
    setScreen("login");
  };

  const handleRegister = async (u: User) => {
    setUser(u);
    setScreen("home");
    if (u.id) {
      const decls = await loadDeclarations(u.id);
      setDeclarations(decls);
    }
  };

  const navigate = (s: Screen) => setScreen(s);
  const goHome = () => setScreen("home");
  const goBack = () => setScreen("home");

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onLogin={handleLogin} onRegister={() => setScreen("register")} />;
      case "register":
        return <RegisterScreen onRegister={handleRegister} onLogin={() => setScreen("login")} />;
      case "home":
        return user ? (
          <HomeScreen user={user} declarations={declarations} onNavigate={navigate} onLogout={handleLogout} />
        ) : null;
      case "vehicle":
        return user ? (
          <VehicleScreen user={user} declarations={declarations} setDeclarations={setDeclarations} onBack={goBack} onHome={goHome} />
        ) : null;
      case "minor":
        return user ? (
          <MinorAuthScreen user={user} declarations={declarations} setDeclarations={setDeclarations} onBack={goBack} onHome={goHome} />
        ) : null;
      case "food":
        return user ? (
          <FoodScreen user={user} declarations={declarations} setDeclarations={setDeclarations} onBack={goBack} onHome={goHome} />
        ) : null;
      case "pet":
        return user ? (
          <PetScreen user={user} declarations={declarations} setDeclarations={setDeclarations} onBack={goBack} onHome={goHome} />
        ) : null;
      case "declarations":
        return user ? (
          <DeclarationsScreen user={user} declarations={declarations} onBack={goBack} onHome={goHome} onNavigate={navigate} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #E8EAF6 0%, #F0F0F0 50%, #E3F2FD 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { borderRadius: 10, fontWeight: 600, fontSize: 14 } }}
      />
      {/* Phone frame */}
      <div style={{
        width: 430,
        background: "#2C2C2C",
        borderRadius: 52,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)",
        padding: "16px",
        position: "relative",
        flexShrink: 0
      }}>
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -4, top: 110, width: 4, height: 32, background: "#3a3a3a", borderRadius: "4px 0 0 4px" }} />
        <div style={{ position: "absolute", left: -4, top: 155, width: 4, height: 54, background: "#3a3a3a", borderRadius: "4px 0 0 4px" }} />
        <div style={{ position: "absolute", left: -4, top: 220, width: 4, height: 54, background: "#3a3a3a", borderRadius: "4px 0 0 4px" }} />
        <div style={{ position: "absolute", right: -4, top: 155, width: 4, height: 80, background: "#3a3a3a", borderRadius: "0 4px 4px 0" }} />

        {/* Status bar */}
        <div style={{
          height: 28, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px", marginBottom: 2
        }}>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600 }}>9:41</span>
          <div style={{ width: 80, height: 20, background: "#1a1a1a", borderRadius: 12 }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10 }}>📶</span>
            <span style={{ fontSize: 10 }}>🔋</span>
          </div>
        </div>

        {/* Screen area */}
        <div style={{
          height: 844,
          background: "#F8F9FA",
          borderRadius: 38,
          overflow: "hidden",
          overflowY: "auto",
          position: "relative",
          scrollbarWidth: "none"
        }}>
          {renderScreen()}
        </div>

        {/* Home indicator */}
        <div style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

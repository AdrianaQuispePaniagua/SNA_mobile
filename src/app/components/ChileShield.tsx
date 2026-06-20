export function ChileShield() {
  return (
    <div style={{
      width: 70, height: 70, background: "white", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 3px 10px rgba(0,0,0,0.2)"
    }}>
      <svg viewBox="0 0 52 58" width="42" height="46">
        <defs>
          <clipPath id="sc">
            <path d="M26,2 L50,13 L50,37 C50,50 26,57 26,57 C26,57 2,50 2,37 L2,13 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#sc)">
          <rect x="0" y="0" width="26" height="58" fill="#0033A0" />
          <rect x="26" y="0" width="26" height="58" fill="#D32F2F" />
          <rect x="0" y="36" width="52" height="22" fill="#D32F2F" />
          <rect x="0" y="36" width="26" height="22" fill="#0033A0" />
          <rect x="0" y="32" width="52" height="4" fill="white" opacity="0.4" />
          <polygon
            points="26,11 28.8,20 38,20 30.6,25.6 33.4,34.6 26,29 18.6,34.6 21.4,25.6 14,20 23.2,20"
            fill="white"
          />
        </g>
        <path d="M26,2 L50,13 L50,37 C50,50 26,57 26,57 C26,57 2,50 2,37 L2,13 Z"
          fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      </svg>
    </div>
  );
}

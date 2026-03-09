import dilgIcon from "../../Dilg.svg";

export default function KioskMenuScreen({ visible, settings, onSelectSection, inactBarRef }) {
  const menuItems = [
    {
      id: "internal",
      label: "Internal Services",
      desc: "Services for DILG staff and employees",
      color: "#0038A8",
    },
    {
      id: "external",
      label: "External Services",
      desc: "Services for the public",
      color: "#C9282D",
    },
    {
      id: "feedback",
      label: "Feedback & Complaints",
      desc: "How to provide feedback or file complaints",
      color: "#FFDE15",
    },
    {
      id: "offices",
      label: "List of Offices",
      desc: "Contact details of DILG offices",
      color: "#0a7c4b",
    },
    {
      id: "issuances",
      label: "Policies & Issuances",
      desc: "Compliance references and deadlines",
      color: "#b45309",
    },
  ];

  return (
    <div className={`menu-screen${visible ? " visible" : ""}`}>
      <div className="menu-header">
        <div className="menu-header-left">
          <div className="menu-header-logo">
            <img src={dilgIcon} alt="DILG Logo" />
          </div>
          <div className="menu-office">{settings.office}</div>
        </div>
        <div className="menu-title">Main Menu</div>
        <div className="menu-header-right"></div>
        <div ref={inactBarRef} className="inact-bar-menu"></div>
      </div>

      <div className="menu-grid">
        {menuItems.map(item => (
          <div
            key={item.id}
            className="menu-card"
            onClick={() => onSelectSection(item.id)}
            style={{ borderTopColor: item.color }}
          >
            <div className="menu-label">{item.label}</div>
            <div className="menu-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="menu-footer">
        <div className="menu-footer-text">
          {settings.hours}
        </div>
      </div>
    </div>
  );
}

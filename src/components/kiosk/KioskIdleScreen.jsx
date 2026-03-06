import dilgIcon from "../../Dilg.svg";
import touchIcon from "../../assets/icons/touch.svg";

export default function KioskIdleScreen({ hiding, settings, onShowMain }) {
  return (
    <div className={`idle-screen${hiding ? " hiding" : ""}`} onClick={!hiding ? onShowMain : undefined}>
      <div className="idle-bg" />
      <div className="idle-pat" />
      <div className="idle-seal"><img src={dilgIcon} alt="DILG Seal" /></div>
      <div className="idle-title">{settings.kioskTitle}</div>
      <div className="idle-sub">{settings.tagline}</div>
      <div className="idle-office">{settings.office} | {settings.address}</div>
      <div className="idle-tap">
        <div className="tap-ring">
          <img className="touchIcon" src={touchIcon} alt="Touch icon" />
        </div>
        <div className="tap-label">Pindutin para Magsimula</div>
      </div>
      <div className="idle-footer">
        Department of the Interior and Local Government | Republic of the Philippines | {settings.hours}
      </div>
    </div>
  );
}

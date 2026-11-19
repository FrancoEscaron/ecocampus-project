import { Link } from "react-router-dom";

export default function HeaderSimple() {
  return (
    <header>
      <div className="inner-header">
        <Link className="brand" to="/" aria-label="EcoCampus">
          <img
            className="brand-logo"
            aria-hidden="true"
            src="/assets/icons/EcoCampus.png"
            alt="logo de ecocampus"
          />
          <span className="brand-name">
            <strong>Eco</strong>Campus
          </span>
        </Link>
      </div>
    </header>
  );
}

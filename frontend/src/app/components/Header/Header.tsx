"use client";
import styles from "./header.module.css";

const Header = () => {
  const toggleSidebar = () => {
    window.dispatchEvent(new Event("psc:toggleSidebar"));
  };

  return (
      <header
          className={`${styles.header} d-flex align-items-center gap-3 py-3 px-4`}
      >
        <button
            type="button"
            className="btn btn-link p-0 me-3"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-3 text-primary"></i>
        </button>

        <a href="#" className="text-decoration-none text-reset">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-md-3">
            <h1 className="m-0">SUPRIM ATLAS</h1>
            <div>
              <span className="fs-5 fw-bolder">Accelerating knowledge on Primary Sclerosing Cholangitis</span>
              <p className="fst-italic m-0">A global open access collaborative resource</p>
            </div>
          </div>
        </a>
        <span className="ms-auto text-primary fw-bold">KI</span>
      </header>
  );
};

export default Header;

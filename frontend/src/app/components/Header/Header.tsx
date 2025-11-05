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

        <a href="#" >
          <strong>SUPRIM ATLAS</strong>{" "}
          studying Primary sclerosing cholangitis
        </a>
        <span className="ms-auto text-primary fw-bold">KI</span>
      </header>
  );
};

export default Header;

import styles from "./header.module.css";

const Header = () => {
  return (
    <header
      className={`${styles.header} container pt-6 pb-2_5 pt-lg-7 pb-lg-3 fs-6`}
    >
      <div className="row">
        <a href="#" className="col-11 align-self-end">
          <strong>SUPRIM ATLAS</strong> studying Primary sclerosing cholangitis
        </a>
        <span className="col-1">KI</span>
      </div>
    </header>
  );
};

export default Header;

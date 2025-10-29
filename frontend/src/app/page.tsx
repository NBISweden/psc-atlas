import styles from "./page.module.css";
import "./globals.scss";

export default function Home() {
  return (
    <section>
      <h1>PSC Atlas</h1>
      <p>Hello world!</p>
      <button type="button" className="btn btn-accent">
        Button test
      </button>
      <button type="button" className="btn btn-outline-accent">
        Outline test
      </button>
      <div className="form-check">
        <input
          className="form-check-input p-2"
          type="checkbox"
          value=""
          id="flexCheckDefault"
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          Default checkbox
        </label>
      </div>
      <select className="form-select" aria-label="Default select example">
        <option selected>Open this select menu</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </select>
    </section>
  );
}

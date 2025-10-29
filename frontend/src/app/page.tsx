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
    </section>
  );
}

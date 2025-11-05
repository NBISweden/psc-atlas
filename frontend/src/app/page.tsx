"use client";

import Link from "next/link";

const Home = () => {
  return (
    <>
      <section>
        <h1>PSC Atlas</h1>
        <p>Hello world!</p>
        <button type="button" className="btn btn-primary">
          Button test
        </button>
        <button type="button" className="btn btn-outline-primary">
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
        <select
          className="form-select"
          defaultValue="0"
          aria-label="Default select example"
        >
          <option value="0">Open this select menu</option>
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </select>
      </section>
      <section>
        <nav>
          <Link href="/explore-data">Explore Data</Link>
        </nav>
      </section>
    </>
  );
};

export default Home;

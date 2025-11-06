"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.scss";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [underMenuOpen, setUnderMenuOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setOpen(false);
        }
    }, []);

    useEffect(() => {
        const handler = () => setOpen((prev) => !prev);
        window.addEventListener("psc:toggleSidebar", handler);
        return () => window.removeEventListener("psc:toggleSidebar", handler);
    }, []);

    return (
        <aside
            className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}
        >
            <div className={styles.inner}>
                <button
                    type="button"
                    className={`btn btn-link p-0 d-md-none ${styles["mobile-close"]}`}
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                >
                    <i className="bi bi-x fs-3 text-primary"></i>
                </button>
                <h2 className="h5 fw-bold mb-3">Menu</h2>
                <div className={styles["red-line"]}></div>
                <ul className="list-unstyled mb-4">
                    <li className={styles.item}>
                        <Link href="/" className={styles["sidebar-link"]}>
                            Home
                        </Link>
                    </li>

                    <li className={styles.item}>
                        <button
                            type="button"
                            className={`${styles.summary} btn btn-link p-0 w-100 text-start d-flex justify-content-between align-items-center`}
                            onClick={() => setUnderMenuOpen((p) => !p)}
                            aria-expanded={underMenuOpen}
                        >
                            <span>Data exploration</span>
                            <i
                                className={`bi ms-2 ${
                                    underMenuOpen ? "bi-chevron-up" : "bi-chevron-down"
                                }`}
                            ></i>
                        </button>
                        {underMenuOpen && (
                            <ul className="list-unstyled ms-3 mt-2">
                                <li>
                                    <Link href="#" className={styles["sub-link"]}>
                                        Protein 7k, plasma
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className={styles["sub-link"]}>
                                        metabolite, plasma
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className={styles["sub-link"]}>
                                        miRNA, plasma
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li className={styles.item}>
                        <Link href="#" className={styles["sidebar-link"]}>
                            The Project
                        </Link>
                    </li>
                    <li className={styles.item}>
                        <Link href="#" className={styles["sidebar-link"]}>
                            Publications
                        </Link>
                    </li>
                    <li className={styles.item}>
                        <Link href="#" className={styles["sidebar-link"]}>
                            Request data for research
                        </Link>
                    </li>
                </ul>

                <h3 className="h5 fw-bold mb-2">Contact</h3>
                <div className={styles["red-line"]}></div>
                <p className="small mt-3 mb-3">
                    Sed varius enim lorem ullamcorper dolore aliquam aenean ornare velit
                    lacus, ac varius enim lorem ullamcorper dolore.
                </p>
                <ul className="list-unstyled small">
                    <li className={`${styles.item} mb-2 d-flex align-items-center gap-2`}>
                        <i className="bi bi-envelope-fill fs-4 text-primary"></i>
                        <a href="#">
                            information@untitled.tld
                        </a>
                    </li>
                    <li className={`${styles.item} mb-2 d-flex align-items-center gap-2`}>
                        <i className="bi bi-telephone-fill fs-4 text-primary"></i>
                        (000) 000-0000
                    </li>
                    <li className={`${styles.item} mb-2 d-flex align-items-center gap-2`}>
                        <i className="bi bi-house-fill fs-4 text-primary"></i>
                        1234 Somewhere Road #8254
                        Nashville, TN 00000-0000
                    </li>
                </ul>
            </div>
        </aside>
    );
}

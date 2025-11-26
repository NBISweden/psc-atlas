import styles from "@/app/components/Sidebar/sidebar.module.scss";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import fs from "fs/promises";
import path from "path";

type ContactData = {
    title?: string;
    email?: string;
    address?: string;
};

type ContactMarkdown = {
    data: ContactData;
    content: string | null;
};
async function getContactMarkdown(): Promise<ContactMarkdown> {
    try {
        const filePath = path.join(process.cwd(), "public", "content", "contact.md");

        const raw = await fs.readFile(filePath, "utf8");
        const parsed = matter(raw);

        return {
            data: parsed.data as ContactData,
            content: parsed.content,
        };
    } catch (error) {
        console.error("Error reading contact.md", error);

        return {
            data: {} as ContactData,
            content: null,
        };
    }
}

export default async function Contact() {
    const { data, content } = await getContactMarkdown();
    return (
        <>
            {data.title? <h3 className="h5 fw-bold mb-2">{data.title}</h3>
                :<h3 className="h5 fw-bold mb-2">Contact </h3>}
            <div className={styles["red-line"]}></div>
            {content ? (
                <div className="small mt-3 mb-3">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            ) : (
                <p className="small mt-3 mb-3"><em>Content is missing or could not be loaded.
                </em></p>
            )}
            <ul className="list-unstyled small">
                <li className={`${styles.item} mb-2 d-flex align-items-center gap-2`}>
                    <i className="bi bi-envelope-fill fs-4"></i>
                    {data.email ?
                        (<a href={`mailto:${data.email}`}>{data.email}</a>) : (
                        <p className="small mt-3 mb-3"><em>Email is missing</em></p>
                        )
                    }
                </li>
                <li className={`${styles.item} mb-2 d-flex align-items-center gap-2`}>
                    <i className="bi bi-house-fill fs-4 text-primary"></i>
                    {data.address ? ( data.address) : (
                        <p className="small mt-3 mb-3"><em>Address is missing</em></p>
                    )}
                </li>
            </ul>
        </>
    )
}
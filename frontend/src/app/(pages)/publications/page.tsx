import fs from "fs/promises";
import path from "path";

type Publication = {
    title: string;
    authors: string;
    journal: string;
    pmid?: string;
    url?: string;
};

async function getPublications(): Promise<Publication[]> {
    const filePath = path.join(process.cwd(), "public", "content", "publications.json");
    const raw = await fs.readFile(filePath, "utf8");

    return JSON.parse(raw) as Publication[];
}

export default async function Page() {
    const publications = await getPublications();
    return (
        <>
            <div className="container my-4">
                <div className="row">
                    <div className="col-lg-8 col-xl-8">
                        <h2 className="mb-4">Publications</h2>
                        {publications.map((pub, i) => (
                            <div key={i} className="card mb-3">
                                <h3 className="h5 card-header">{pub.title}</h3>

                                <div className="card-body">
                                    <p className="card-text">{pub.authors}</p>

                                    <div className="text-primary">{pub.journal}</div>

                                    {pub.pmid && (
                                        <div className="text-primary">PMID: {pub.pmid}</div>
                                    )}

                                    <a href={pub.url} className="btn btn-outline-primary mt-2">
                                        Go to publication
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </>
    )
}
/* eslint-disable @next/next/no-img-element */
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import fs from "fs/promises";
import path from "path";
import LeaderCard from "./LeaderCard";
import styles from "./page.module.scss";

type ProjectLeader = {
  name: string;
  email: string;
  imageUrl?: string;
};

type Contributors = {
  country: string;
  flagUrl?: string;
  names: string[];
};

type Funders = {
  name: string;
};

type ProjectData = {
  title?: string;
  leaders?: ProjectLeader[];
  contributors?: Contributors[];
  funders?: Funders[];
};

type ProjectMarkdown = {
  data: ProjectData;
  content: string | null;
};

async function getProjectMarkdown(): Promise<ProjectMarkdown> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "content",
      "the-project.md"
    );

    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);

    return {
      data: parsed.data as ProjectData,
      content: parsed.content,
    };
  } catch (error) {
    console.error("Error reading the-project.md", error);

    return {
      data: {} as ProjectData,
      content: null,
    };
  }
}

const TheProject = async () => {
  const { data, content } = await getProjectMarkdown();

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 col-xl-8">
          <h2 className="h1 py-4">{data.title ? data.title : "The project"}</h2>
          {content && (
            <div className="mb-4 border-bottom pb-4">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
          <section className="border-bottom pb-4 mb-4">
            <h3 className="py-4">Project Leaders</h3>
            <div className="d-flex flex-wrap gap-4">
              {data.leaders?.map((leader, index) => (
                <LeaderCard
                  key={index}
                  name={leader.name}
                  email={leader.email}
                  imageUrl={leader.imageUrl}
                />
              )) || <p>No project leaders listed.</p>}
            </div>
          </section>
          <section className="border-bottom pb-4 mb-4">
            <h3 className="py-4">Contributors</h3>
            {data.contributors ? (
              data.contributors.map((contributor, index) => (
                <div key={index} className="mb-3">
                  <h4 className="h5 d-flex align-items-center gap-2">
                    {contributor.flagUrl && (
                      <img
                        src={contributor.flagUrl}
                        alt={`Flag of ${contributor.country}`}
                        className={styles.flag}
                      />
                    )}
                    {contributor.country}
                  </h4>
                  <p>{contributor.names}</p>
                </div>
              ))
            ) : (
              <p>No contributors listed.</p>
            )}
          </section>
          <section className="pb-4 mb-4">
            <h3 className="py-4">Financial support</h3>
            {data.funders ? (
              <ul className="list-unstyled">
                {data.funders.map((funder, index) => (
                  <li key={index}>{funder.name}</li>
                ))}
              </ul>
            ) : (
              <p>No funders listed.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TheProject;

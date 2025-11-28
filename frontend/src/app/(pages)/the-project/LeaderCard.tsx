/* eslint-disable @next/next/no-img-element */
import styles from "./page.module.scss";

type LeaderCardProps = {
  name: string;
  email: string;
  imageUrl?: string;
};

const LeaderCard = ({ name, email, imageUrl }: LeaderCardProps) => {
  return (
    <div className="d-flex flex-column gap-2 align-items-left justify-content-end">
      {imageUrl && (
        <img
          alt={`Image of ${name}`}
          className={`rounded ${styles.leaderImage}`}
          src={imageUrl}
        />
      )}
      <div>
        <h4 className="h5">{name}</h4>
        <p>
          <a className="fs-6" href={`mailto:${email}`}>
            {email}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LeaderCard;

"use client";

import React, { useState } from "react";
import Plot from "./../components/Plot/Plot";
import exampleData from "./../example-data.json";

const ExploreData: React.FC = () => {
  const [scatterClicked, setScatterClicked] = useState<boolean>(false);
  const [violinClicked, setViolinClicked] = useState<boolean>(false);

  return (
    <>
      <section>
        <div>
          <Plot
            data={[
              {
                x: exampleData.x,
                y: exampleData.y,
                type: "scatter",
                mode: "markers",
                marker: { color: "f56a6a" },
              },
            ]}
            layout={{ width: 700, height: 500 }}
            onClick={() => setScatterClicked(true)}
          />
        </div>
        {scatterClicked && (
          <div>
            <p>The plot has been clicked!</p>
            <button onClick={() => setScatterClicked(false)}>
              Hide me again
            </button>
          </div>
        )}
      </section>
      <section>
        <div>
          <Plot
            data={[
              {
                x: exampleData.category,
                y: exampleData.score,
                type: "violin",
                mode: "markers",
                marker: { color: "f56a6a" },
              },
            ]}
            layout={{ width: 700, height: 500 }}
            onClick={() => setViolinClicked(true)}
          />
        </div>
        {violinClicked && (
          <div>
            <p>The plot has been clicked!</p>
            <button onClick={() => setViolinClicked(false)}>
              Hide me again
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default ExploreData;

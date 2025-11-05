"use client";

import React, { useState } from "react";
import Plot from "./../components/Plot/Plot";
import exampleData from "./../example-data.json";

const ExploreData: React.FC = () => {
  const [boxClicked, setBoxClicked] = useState<boolean>(false);

  return (
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
          onClick={() => setBoxClicked(true)}
        />
      </div>
      {boxClicked && (
        <div>
          <p>The plot has been clicked!</p>
          <button onClick={() => setBoxClicked(false)}>Hide me again</button>
        </div>
      )}
    </section>
  );
};

export default ExploreData;

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
      <section>
        <div>
          <Plot
            data={[
              {
                type: "violin",
                x: exampleData.condition_yes,
                y: exampleData.CCA_yes,
                legendgroup: "Yes",
                scalegroup: "Yes",
                name: "Yes",
                box: {
                  visible: true,
                },
                line: {
                  color: "blue",
                },
                meanline: {
                  visible: true,
                },
              },
              {
                type: "violin",
                x: exampleData.condition_no,
                y: exampleData.CCA_no,
                legendgroup: "No",
                scalegroup: "No",
                name: "No",
                box: {
                  visible: true,
                },
                line: {
                  color: "pink",
                },
                meanline: {
                  visible: true,
                },
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              violinmode: "group",
              title: {
                text: "OID01329",
              },
            }}
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
      <section>
        <div style={{ display: "flex" }}>
          <form style={{ marginRight: "50px" }}>
            <p>What to show on x-axis</p>
            <input type="radio" id="PSC" value="PSC" />
            <label htmlFor="PSC"> PSC</label>
            <br></br>
            <input type="radio" id="CCA" value="CCA" checked={true} />
            <label htmlFor="CCA"> CCA</label>
            <br></br>
            <input type="radio" id="IBD" value="IBD" />
            <label htmlFor="IBD"> IBD</label>
            <br></br>
            <input type="radio" id="Fibrosis" value="Fibrosis" />
            <label htmlFor="Fibrosis"> Fibrosis</label>
            <br></br>
            <input type="radio" id="Bilirubin" value="Bilirubin" />
            <label htmlFor="Bilirubin"> Bilirubin</label>
            <br></br>
            <input type="radio" id="ALP" value="ALP" />
            <label htmlFor="ALP"> ALP</label>
            <br></br>
          </form>
          <form>
            <p>Filter violins by</p>
            <input type="radio" id="PSC" value="PSC" />
            <label htmlFor="PSC"> PSC</label>
            <br></br>
            <input type="radio" id="CCA" value="CCA" />
            <label htmlFor="CCA"> CCA</label>
            <br></br>
            <input type="radio" id="IBD" value="IBD" />
            <label htmlFor="IBD"> IBD</label>
            <br></br>
            <input type="radio" id="Fibrosis" value="Fibrosis" />
            <label htmlFor="Fibrosis"> Fibrosis</label>
            <br></br>
            <input type="radio" id="Bilirubin" value="Bilirubin" />
            <label htmlFor="Bilirubin"> Bilirubin</label>
            <br></br>
            <input type="radio" id="ALP" value="ALP" />
            <label htmlFor="ALP"> ALP</label>
            <br></br>
            <input type="radio" id="None" value="None" checked={true} />
            <label htmlFor="None"> None</label>
            <br></br>
          </form>
        </div>
        <div>
          <Plot
            data={[
              {
                x: exampleData.CCA.group,
                y: exampleData.CCA.value,
                type: "violin",
                mode: "markers",
                marker: { color: "f56a6a" },
              },
            ]}
            layout={{ width: 700, height: 500, title: { text: "CCA" } }}
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
      <section>
        <div style={{ display: "flex" }}>
          <form style={{ marginRight: "50px" }}>
            <p>What to show on x-axis</p>
            <input type="radio" id="PSC" value="PSC" />
            <label htmlFor="PSC"> PSC</label>
            <br></br>
            <input type="radio" id="CCA" value="CCA" checked={true} />
            <label htmlFor="CCA"> CCA</label>
            <br></br>
            <input type="radio" id="IBD" value="IBD" />
            <label htmlFor="IBD"> IBD</label>
            <br></br>
            <input type="radio" id="Fibrosis" value="Fibrosis" />
            <label htmlFor="Fibrosis"> Fibrosis</label>
            <br></br>
            <input type="radio" id="Bilirubin" value="Bilirubin" />
            <label htmlFor="Bilirubin"> Bilirubin</label>
            <br></br>
            <input type="radio" id="ALP" value="ALP" />
            <label htmlFor="ALP"> ALP</label>
            <br></br>
          </form>
          <form>
            <p>Filter violins by</p>
            <input type="radio" id="PSC" value="PSC" />
            <label htmlFor="PSC"> PSC</label>
            <br></br>
            <input type="radio" id="CCA" value="CCA" />
            <label htmlFor="CCA"> CCA</label>
            <br></br>
            <input type="radio" id="IBD" value="IBD" />
            <label htmlFor="IBD"> IBD</label>
            <br></br>
            <input type="radio" id="Fibrosis" value="Fibrosis" checked={true} />
            <label htmlFor="Fibrosis"> Fibrosis</label>
            <br></br>
            <input type="radio" id="Bilirubin" value="Bilirubin" />
            <label htmlFor="Bilirubin"> Bilirubin</label>
            <br></br>
            <input type="radio" id="ALP" value="ALP" />
            <label htmlFor="ALP"> ALP</label>
            <br></br>
            <input type="radio" id="None" value="None" />
            <label htmlFor="None"> None</label>
            <br></br>
          </form>
        </div>
        <div>
          <Plot
            data={[
              {
                type: "violin",
                x: exampleData.CCA_filtered_Fibrosis.CCA_yes.group.concat(
                  exampleData.CCA_filtered_Fibrosis.CCA_no.group
                ),
                y: exampleData.CCA_filtered_Fibrosis.CCA_yes.Fib_high.concat(
                  exampleData.CCA_filtered_Fibrosis.CCA_no.Fib_high
                ),
                legendgroup: "High",
                scalegroup: "High",
                name: "Fibrosis High",
                box: {
                  visible: true,
                },
                line: {
                  color: "blue",
                },
                meanline: {
                  visible: true,
                },
              },
              {
                type: "violin",
                x: exampleData.CCA_filtered_Fibrosis.CCA_yes.group.concat(
                  exampleData.CCA_filtered_Fibrosis.CCA_no.group
                ),
                y: exampleData.CCA_filtered_Fibrosis.CCA_yes.Fib_low.concat(
                  exampleData.CCA_filtered_Fibrosis.CCA_no.Fib_low
                ),
                legendgroup: "Low",
                scalegroup: "Low",
                name: "Fibrosis Low",
                box: {
                  visible: true,
                },
                line: {
                  color: "pink",
                },
                meanline: {
                  visible: true,
                },
              },
              {
                type: "violin",
                x: exampleData.CCA_filtered_Fibrosis.healthy.group,
                y: exampleData.CCA_filtered_Fibrosis.healthy.value,
                legendgroup: "healthy",
                scalegroup: "healthy",
                name: "Healthy",
                box: {
                  visible: true,
                },
                line: {
                  color: "green",
                },
                meanline: {
                  visible: true,
                },
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              violinmode: "group",
              title: {
                text: "CCA",
              },
            }}
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

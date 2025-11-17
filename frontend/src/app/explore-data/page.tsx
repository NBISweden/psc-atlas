"use client";

import React, { useEffect, useState } from "react";
import exampleData from "./../example-data.json";

const ExploreData: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedXaxis, setSelectedXaxis] = useState<Condition>();
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);
  const [selectedLegend, setSelectedLegend] = useState<Condition>();
  const [legendValues, setLegendValues] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>();
  const [data, setData] = useState({});

  // should come from the URL in the future depending on the user's
  // menu choice (metabolite / protein/ miRNA). Should also become a type.
  const dataset = "protein";

  const params = new URLSearchParams();
  params.append("dataset", dataset);

  type Condition = {
    name: string;
    values: string[];
  };

  const getConditions = async () => {
    try {
      const response = await fetch(`/conditions?${params}`);
      if (!response.ok) {
        throw new Error();
      }
      const conditions: Condition[] = await response.json();
      setConditions(conditions);
    } catch (error) {
      console.log(error);
      // for now hardcoded:
      console.log(exampleData.conditions);
      setConditions(exampleData.conditions);
    }
    return;
  };

  const getVariables = async () => {
    try {
      const response = await fetch(`/variables?${params}`);
      if (!response.ok) {
        throw new Error();
      }
      const variables: string[] = await response.json();
      setVariables(variables);
    } catch (error) {
      console.log(error);
      // for now hardcoded:
      console.log(exampleData.variables);
      setVariables(exampleData.variables);
    }
    return;
  };

  useEffect(() => {
    getConditions();
    getVariables();
  }, []);

  const handleSelectXaxis = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedXaxis(
      conditions.find((condition) => condition.name === event.target.value)
    );
  };

  const handleSelectLegend = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLegend(
      conditions.find((condition) => condition.name === event.target.value)
    );
  };

  const handleSelectVariable = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedVariable(event.target.value);
  };

  const handleXAxisValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentXAxisValues = xAxisValues;
    let newXAxisValues;
    if (currentXAxisValues?.includes(event.target.value)) {
      newXAxisValues = currentXAxisValues.filter(
        (v) => v !== event.target.value
      );
    } else {
      newXAxisValues = [...currentXAxisValues, event.target.value];
    }
    setXAxisValues(newXAxisValues);
  };

  const handleLegendValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentLegendValues = legendValues;
    let newLegendValues;
    if (currentLegendValues?.includes(event.target.value)) {
      newLegendValues = currentLegendValues.filter(
        (v) => v !== event.target.value
      );
    } else {
      newLegendValues = [...currentLegendValues, event.target.value];
    }
    setLegendValues(newLegendValues);
  };

  const createBody = () => {
    const body = {
      dataset: dataset,
      xAxisCondition: {
        name: selectedXaxis?.name,
        values: xAxisValues,
      },
      legendCondition: {
        name: selectedLegend?.name,
        values: legendValues,
      },
      variable: selectedVariable,
    };
    return JSON.stringify({ filters: body });
  };

  const getPlotData = async () => {
    try {
      const response = await fetch("/plotdata", {
        method: "POST",
        body: createBody(),
      });
      if (!response.ok) {
        throw new Error();
      }
      setData(response.json);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section>
        <div>
          <form className="d-flex flex-column mb-5">
            <h5>Choose your x-axis variable</h5>
            <label htmlFor="xAxis">Select condition</label>
            <select
              id="xAxis"
              value={selectedXaxis ? selectedXaxis.name : ""}
              onChange={handleSelectXaxis}
              className="mb-3"
            >
              <option value="" disabled></option>
              {conditions.map((condition) => (
                <option key={condition.name} value={condition.name}>
                  {condition.name}
                </option>
              ))}
            </select>

            {selectedXaxis && (
              <fieldset>
                <legend className="fs-6">
                  Which values should be included?
                </legend>
                {selectedXaxis.values.map((value) => (
                  <div key={value}>
                    <input
                      type="checkbox"
                      id={value}
                      value={value}
                      onChange={handleXAxisValues}
                    />
                    <label htmlFor={value}>{value}</label>
                  </div>
                ))}
                <div className="my-3">
                  <input type="checkbox" id="healthy" value="healthy" />
                  <label htmlFor="healthy">
                    Include healthy reference samples
                  </label>
                </div>
              </fieldset>
            )}

            <h5>Choose your legend variable</h5>
            <label htmlFor="legend">Select condition</label>
            <select
              id="legend"
              value={selectedLegend ? selectedLegend.name : ""}
              onChange={handleSelectLegend}
              className="mb-3"
            >
              <option value="" disabled></option>
              {conditions.map((condition) => (
                <option key={condition.name} value={condition.name}>
                  {condition.name}
                </option>
              ))}
            </select>

            {selectedLegend && (
              <fieldset>
                <legend className="fs-6">
                  Which values should be included?
                </legend>
                {selectedLegend.values.map((value) => (
                  <div key={value}>
                    <input
                      type="checkbox"
                      id={value}
                      value={value}
                      onChange={handleLegendValues}
                    />
                    <label htmlFor={value}>{value}</label>
                  </div>
                ))}
                <div className="my-3">
                  <input
                    type="checkbox"
                    id="healthy"
                    value="healthy"
                    onChange={handleLegendValues}
                  />
                  <label htmlFor="healthy">
                    Include healthy reference samples
                  </label>
                </div>
              </fieldset>
            )}

            <h5>Select your {dataset}</h5>
            <label htmlFor="variable">Select {dataset}</label>
            <select
              id="variable"
              value={selectedVariable ? selectedVariable : ""}
              onChange={handleSelectVariable}
            >
              <option value="" disabled></option>
              {variables.map((variable) => (
                <option key={variable} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </form>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => getPlotData()}
          >
            Create plot
          </button>
        </div>
      </section>
    </>
  );
};

export default ExploreData;

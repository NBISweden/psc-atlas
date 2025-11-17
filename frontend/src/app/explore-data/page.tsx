"use client";

import React, { useEffect, useState } from "react";
import exampleData from "./../example-data.json";

const ExploreData: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedXaxis, setSelectedXaxis] = useState<Condition>();
  const [selectedLegend, setSelectedLegend] = useState<Condition>();
  const [selectedVariable, setSelectedVariable] = useState<string>();

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
                    <input type="checkbox" id={value} />
                    <label htmlFor={value}>{value}</label>
                  </div>
                ))}
                <div className="my-3">
                  <input type="checkbox" id="healthy" />
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
                    <input type="checkbox" id={value} />
                    <label htmlFor={value}>{value}</label>
                  </div>
                ))}
                <div className="my-3">
                  <input type="checkbox" id="healthy" />
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
          <button type="button" className="btn btn-primary">
            Create plot
          </button>
        </div>
      </section>
    </>
  );
};

export default ExploreData;

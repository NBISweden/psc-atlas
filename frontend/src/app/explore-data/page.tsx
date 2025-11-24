"use client";

import React, { useEffect, useState } from "react";
import exampleData from "./../example-data.json";
import { toggleArray } from "../utils";

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
  const dataset = "proteins";

  type Condition = {
    name: string;
    values: string[];
  };

  type ConditionResponse = {
    conditions: Condition[];
  };

  type Variable = {
    names: string[];
  };

  const getConditions = async () => {
    try {
      const response = await fetch(`/api/v1/sample/conditions?type=${dataset}`);
      if (!response.ok) {
        throw new Error();
      }
      const fetchedConditions: ConditionResponse = await response.json();
      setConditions(fetchedConditions.conditions);
    } catch (error) {
      console.log("Error finding conditions:", error);
      setConditions([]);
    }
    return;
  };

  const getVariables = async () => {
    try {
      const response = await fetch(`/api/v1/variable/names?type=${dataset}`);
      if (!response.ok) {
        throw new Error();
      }
      const fetchedVariables: Variable = await response.json();
      setVariables(fetchedVariables.names);
    } catch (error) {
      console.log("Error finding variables", error);
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
    setXAxisValues([]);
  };

  const handleSelectLegend = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLegend(
      conditions.find((condition) => condition.name === event.target.value)
    );
    setLegendValues([]);
  };

  const handleSelectVariable = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedVariable(event.target.value);
  };

  const handleXAxisValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newXAxisValues = toggleArray(xAxisValues, event.target.value);
    setXAxisValues(newXAxisValues);
  };

  const handleLegendValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLegendValues = toggleArray(legendValues, event.target.value);
    setLegendValues(newLegendValues);
  };

  const createBody = () => {
    const body = {
      dataset: dataset,
      conditions: [
        {
          name: selectedXaxis?.name,
          values: xAxisValues,
        },
        {
          name: selectedLegend?.name,
          values: legendValues,
        },
      ],
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
              className="form-select mb-3"
            >
              <option value="" disabled>
                No condition selected
              </option>
              {conditions &&
                conditions.map((condition) => (
                  <option key={"x-" + condition.name} value={condition.name}>
                    {condition.name}
                  </option>
                ))}
            </select>

            {selectedXaxis && (
              <fieldset>
                <legend className="fs-6">
                  Which values should be included?
                </legend>
                {selectedXaxis.values
                  .filter((value) => value !== null)
                  .map((value) => (
                    <div key={value} className="form-check">
                      <input
                        type="checkbox"
                        id={value}
                        value={value}
                        onChange={handleXAxisValues}
                        className="form-check-input"
                      />
                      <label htmlFor={value}>{value}</label>
                    </div>
                  ))}
                {selectedXaxis.values.some((value) => value == null) && (
                  <div className="form-check my-3">
                    <input
                      type="checkbox"
                      id="xHealthy"
                      value="NA"
                      onChange={handleXAxisValues}
                      className="form-check-input"
                    />
                    <label htmlFor="xHealthy">
                      Include healthy reference samples
                    </label>
                  </div>
                )}
              </fieldset>
            )}

            <h5>Choose your legend variable</h5>
            <label htmlFor="legend">Select condition</label>
            <select
              id="legend"
              value={selectedLegend ? selectedLegend.name : ""}
              onChange={handleSelectLegend}
              className="form-select mb-3"
            >
              <option value="">No condition selected</option>
              {conditions &&
                conditions.map((condition) => (
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
                {selectedLegend.values
                  .filter((value) => value !== null)
                  .map((value) => (
                    <div key={value} className="form-check">
                      <input
                        type="checkbox"
                        id={value}
                        value={value}
                        onChange={handleLegendValues}
                        className="form-check-input"
                      />
                      <label htmlFor={value}>{value}</label>
                    </div>
                  ))}
                {selectedLegend.values.some((value) => value == null) && (
                  <div className="form-check my-3">
                    <input
                      type="checkbox"
                      id="legendHealthy"
                      value="NA"
                      onChange={handleLegendValues}
                      className="form-check-input"
                    />
                    <label htmlFor="legendHealthy">
                      Include healthy reference samples
                    </label>
                  </div>
                )}
              </fieldset>
            )}

            <h5>Select your {dataset}</h5>
            <label htmlFor="variable">Select {dataset}</label>
            <select
              id="variable"
              value={selectedVariable ? selectedVariable : ""}
              onChange={handleSelectVariable}
              className="form-select"
            >
              <option value="" disabled></option>
              {variables &&
                variables.map((variable) => (
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
            disabled={
              !selectedXaxis || xAxisValues.length == 0 || !selectedVariable
            }
          >
            Create plot
          </button>
        </div>
      </section>
    </>
  );
};

export default ExploreData;

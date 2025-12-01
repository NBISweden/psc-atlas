"use client";

import React, { useEffect, useState, useMemo } from "react";
import Plot from "../components/Plot/Plot";
import { toggleArray } from "../utils";

const ExploreData: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedXaxis, setSelectedXaxis] = useState<Condition>();
  const [xAxisValues, setXAxisValues] = useState<string[]>([]);
  const [selectedLegend, setSelectedLegend] = useState<Condition>();
  const [legendValues, setLegendValues] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>();
  const [data, setData] = useState<MeasurementResponse[]>([]);
  const [plotInfo, setPlotInfo] = useState<PlotInfo>({
    xAxisVar: "",
    legendVar: "",
    xAxisValues: [],
    legendValues: [],
    violinColors: ["blue", "pink", "green"],
  });

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

  type VariableResponse = {
    variables: string[];
  };

  type MeasurementResponse = {
    variable: string;
    conditions: Condition[];
    values: number[];
  };

  type PlotInfo = {
    xAxisVar: string;
    legendVar: string;
    xAxisValues: string[];
    legendValues: string[];
    violinColors: string[];
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
      const response = await fetch(`/api/v1/sample/variables?type=${dataset}`);
      if (!response.ok) {
        throw new Error();
      }
      const fetchedVariables: VariableResponse = await response.json();
      setVariables(fetchedVariables.variables);
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
    setXAxisValues([]);
    setSelectedXaxis(
      conditions.find((condition) => condition.name === event.target.value)
    );
  };

  const handleSelectLegend = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLegendValues([]);
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
    const newXAxisValues = toggleArray(xAxisValues, event.target.value);
    setXAxisValues(newXAxisValues);
  };

  const handleLegendValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLegendValues = toggleArray(legendValues, event.target.value);
    setLegendValues(newLegendValues);
  };

  const createConditions = () => {
    const body = [
      {
        name: selectedXaxis?.name,
        values: xAxisValues,
      },
    ];
    selectedLegend &&
      body.push({
        name: selectedLegend?.name,
        values: legendValues,
      });
    return JSON.stringify(body);
  };

  const getData = async () => {
    const currentPlotInfo = plotInfo;
    currentPlotInfo.xAxisVar = selectedXaxis ? selectedXaxis.name : "";
    currentPlotInfo.legendVar = selectedLegend ? selectedLegend.name : "";
    currentPlotInfo.xAxisValues = xAxisValues;
    currentPlotInfo.legendValues = legendValues;
    setPlotInfo(currentPlotInfo);
    try {
      const response = await fetch(
        `/api/v1/sample/measurements?type=${dataset}&variable=${selectedVariable}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: createConditions(),
        }
      );
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      console.log("We got the data!!", data);
      setData(data.measurements);
    } catch (error) {
      console.log(error);
    }
  };

  const calculateViolinData = (
    data: MeasurementResponse[],
    legendValue: string,
    legendVar: string,
    xAxisVar: string
  ): [string[], number[]] => {
    if (!data || data.length === 0) return [[], []];

    const filtered = data.filter((item) =>
      item.conditions.some(
        (c) => c.name === legendVar && c.values.includes(legendValue)
      )
    );

    const x: string[] = [];
    const y: number[] = [];

    filtered.forEach((obj) => {
      // push all y values
      y.push(...obj.values);

      // find the x-axis value for this object (use first value or fallback "")
      const currentXvalue =
        obj.conditions.find((c) => c.name === xAxisVar)?.values?.[0] ?? "";

      // add the same x value for each y entry from this object
      x.push(
        ...Array(obj.values.length).fill(
          `${plotInfo.xAxisVar} - ${currentXvalue}`
        )
      );
    });

    return [x, y];
  };

  const violinA = useMemo(
    () =>
      calculateViolinData(
        data,
        plotInfo.legendValues[0],
        plotInfo.legendVar,
        plotInfo.xAxisVar
      ),
    [data, plotInfo]
  );

  const violinB = useMemo(
    () =>
      calculateViolinData(
        data,
        plotInfo.legendValues[1],
        plotInfo.legendVar,
        plotInfo.xAxisVar
      ),
    [data, plotInfo]
  );

  // destructure before rendering so we don't call the function multiple times:
  const [xA, yA] = violinA;
  const [xB, yB] = violinB;

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
              <fieldset className="mb-3">
                <legend className="fs-6">
                  Which values should be included?
                </legend>
                {selectedXaxis.values
                  .filter((value) => value !== "NA")
                  .map((value) => (
                    <div key={value} className="form-check">
                      <input
                        type="checkbox"
                        id={`${selectedXaxis.name}-${value}`}
                        value={value}
                        checked={xAxisValues.includes(value)}
                        onChange={handleXAxisValues}
                        className="form-check-input"
                      />
                      <label htmlFor={value}>{value}</label>
                    </div>
                  ))}
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
              <fieldset className="mb-3">
                <legend className="fs-6">
                  Which values should be included?
                </legend>
                {selectedLegend.values
                  .filter((value) => value !== "NA")
                  .map((value) => (
                    <div key={value} className="form-check">
                      <input
                        type="checkbox"
                        id={`${selectedLegend.name}-${value}`}
                        value={value}
                        checked={legendValues.includes(value)}
                        onChange={handleLegendValues}
                        className="form-check-input"
                      />
                      <label htmlFor={value}>{value}</label>
                    </div>
                  ))}
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
            onClick={() => getData()}
            disabled={
              !selectedXaxis || xAxisValues.length == 0 || !selectedVariable
            }
          >
            Create plot
          </button>
        </div>
      </section>
      <section>
        {data && data.length > 0 && (
          <Plot
            data={[
              {
                type: "violin",
                x: xA,
                y: yA,
                legendgroup: "groupA",
                name: `${plotInfo.legendVar} - ${plotInfo.legendValues[0]}`,
                box: { visible: true },
                line: { color: plotInfo.violinColors[0] },
                meanline: { visible: true },
                showlegend: true,
                visible: yA.length == 0 ? "legendonly" : true,
              },
              {
                type: "violin",
                x: xB,
                y: yB,
                legendgroup: "groupB",
                name: `${plotInfo.legendVar} - ${plotInfo.legendValues[1]}`,
                box: { visible: true },
                line: { color: plotInfo.violinColors[1] },
                meanline: { visible: true },
                showlegend: true,
                visible: yB.length == 0 ? "legendonly" : true,
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              violinmode: "group",
              title: {
                text: "",
              },
            }}
            onClick={() => console.log("clicked")}
          />
        )}
      </section>
    </>
  );
};

export default ExploreData;

import React, { Component } from 'react';

import ProjectPreview from '../ProjectPreview';

import './styles.css';

class Preview extends Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    const { projects, contexts, typonyms, saveProject } = this.props;

    const computedProjects = projects.map(project => {
      const computedValues = contexts
        .map(contextName => {
          const value = this.state[contextName] || 0;
          const typonym = typonyms[project.id + '-' + contextName];

          if (!typonym) {
            return {};
          }

          return Object.entries(project.values)
            .map(([paramName, paramBaseValue]) => {
              // get the keypoints sorted from 0 to 100
              const sortedKeypoints = [...typonym.keypoints].sort(
                (a, b) => a[0] > b[0]
              );

              if (sortedKeypoints[0][1][paramName] === undefined)
                sortedKeypoints[0][1][paramName] = paramBaseValue;
              if (
                sortedKeypoints[sortedKeypoints.length - 1][1][paramName] ===
                undefined
              )
                sortedKeypoints[sortedKeypoints.length - 1][1][
                  paramName
                ] = paramBaseValue;

              // finding the right value to diff
              let minIndex = 0;
              let maxIndex = 0;
              sortedKeypoints.forEach((keypoint, i) => {
                // In case the parameter hasn't been defined for this keypoint
                if (!keypoint[1][paramName]) {
                  return;
                }

                const prevMinDiff = value - sortedKeypoints[minIndex][0];
                const prevMaxDiff = value - sortedKeypoints[maxIndex][0];
                const diff = value - keypoint[0];

                // smaller diff, minimum changes
                if (diff >= 0 && diff < prevMinDiff) {
                  minIndex = i;
                }

                // smaller negative diff, maximum changes
                if (diff <= 0 && (diff > prevMaxDiff || prevMaxDiff > 0)) {
                  maxIndex = i;
                }
              });

              let topKeypoint = sortedKeypoints[maxIndex];
              let bottomKeypoint = sortedKeypoints[minIndex];
              let topValue = topKeypoint[1][paramName];
              let bottomValue = bottomKeypoint[1][paramName];

              // console.log(paramName, ' topValue: ', maxIndex, '→', topValue, 'bottomValue: ', minIndex, '→', bottomValue);

              if (maxIndex === 0 && value !== 0) {
                // finding the upper keypoint that has the parameter defined, so we can compute the coeff
                const upperKeypoint = sortedKeypoints
                  .slice(minIndex + 1)
                  .find(keypoint => keypoint[1].hasOwnProperty(paramName));
                topKeypoint = upperKeypoint || [
                  100,
                  { [paramName]: paramBaseValue },
                ];
                topValue = topKeypoint[1][paramName];
              } else if (minIndex === maxIndex) {
                // top and bottom are the same
                return [paramName, sortedKeypoints[minIndex][1][paramName]];
              }

              const coeff =
                (topValue - bottomValue) / (topKeypoint[0] - bottomKeypoint[0]);
              const b = bottomValue - coeff * bottomKeypoint[0];

              return [paramName, value * coeff + b];
            })
            .reduce((values, [name, value]) => {
              values[name] = value;
              return values;
            }, {});
        })
        .reduce((prev, keypointValues) => {
          // mean between each context
          Object.entries(keypointValues).forEach(([key, value]) => {
            if (prev[key] && value) {
              prev[key] = (prev[key] + value) / 2;
              return;
            }

            prev[key] = prev[key] || value;
          });

          return prev;
        });

      return {
        ...project,
        values: computedValues,
      };
    });

    return (
      <div className="Preview">
        <form className="ContextsParams Preview-contexts">
          <ul className="ContextsParams-list ParamsList-list">
            {contexts.map(name => (
              <li
                key={name}
                className="ContextsParams-list-item ParamsList-item"
              >
                <span className="ParamsList-item-label">{name}</span>
                <input
                  className="ParamsList-item-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={this.state[name] || 0}
                  onChange={e =>
                    this.setState({ [name]: Number(e.target.value) })}
                />
              </li>
            ))}
          </ul>

          <button
            className="Preview-save"
            onClick={e => {
              e.preventDefault();
              saveProject();
            }}
          >
            Save
          </button>
        </form>

        <ul className="Preview-typonyms">
          {computedProjects.map(project => (
            <li className="Preview-typonyms-item">
              <ProjectPreview
                key={project.id}
                id={project.id}
                name={project.name}
                values={project.values}
                context={0}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Preview;

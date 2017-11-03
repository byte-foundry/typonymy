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

          const sortedKeypoints = [...typonym.keypoints].sort(
            (a, b) => a[0] > b[0],
          );

          let minIndex = 0;
          let maxIndex = 0;
          sortedKeypoints.forEach((keypoint, i) => {
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

          const result = { ...sortedKeypoints[minIndex][1] };

          if (minIndex === maxIndex) {
            return result;
          }

          const topKeypoint = sortedKeypoints[maxIndex];
          const bottomKeypoint = sortedKeypoints[minIndex];
          Object.entries(result).forEach(([key, paramValue]) => {
            const coeff =
              (topKeypoint[1][key] - paramValue) /
              (topKeypoint[0] - bottomKeypoint[0]);
            const b = paramValue - coeff * bottomKeypoint[0];

            result[key] = value * coeff + b;
          });

          return result;
        })
        .reduce((prev, keypointValues) => {
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

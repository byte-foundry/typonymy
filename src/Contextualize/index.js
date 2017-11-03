/* global Ptypo */

import React, { Component } from 'react';

import Curve from '../Curve';

import './styles.css';

class Contextualize extends Component {
  constructor() {
    super();

    this.state = {
      font: null,
      selectedKeypointIndex: 0,
    };
  }

  async componentDidMount() {
    var prototypoFontFactory = new Ptypo.default();

    const font = await prototypoFontFactory.createFont(
      'CustomFont2',
      Ptypo.templateNames.SPECTRAL,
    );

    this.setState({ font });

    window.fitText(document.getElementById('responsive-font-input'));
  }

  componentWillReceiveProps({ project, context, typonym }) {
    if (
      project.id !== this.props.project.id ||
      context !== this.props.context ||
      typonym.keypoints.length < this.props.typonym.keypoints.length
    ) {
      this.setState({ selectedKeypointIndex: 0 });
    } else if (typonym.keypoints.length > this.props.typonym.keypoints.length) {
      this.setState({ selectedKeypointIndex: typonym.keypoints.length - 1 });
    }
  }

  componentDidUpdate(prevState) {
    const currentKeypoint = this.props.typonym.keypoints[
      this.state.selectedKeypointIndex
    ];
    this.state.font &&
      prevState.selectedKeypointIndex !== this.state.selectedKeypointIndex &&
      this.state.font.changeParams({
        ...this.props.project.values,
        ...currentKeypoint[1],
      });
  }

  updateKeypoints = keypoints => {
    this.props.updateTyponym({
      ...this.props.typonym,
      keypoints,
    });
  };

  createKeypoint = position => {
    this.updateKeypoints(
      this.props.typonym.keypoints.concat([
        [position, /*this.props.project.values*/ {}],
      ]),
    );
  };

  saveParam = (name, value) => {
    const { selectedKeypointIndex } = this.state;
    const { typonym } = this.props;

    this.updateKeypoints([
      ...typonym.keypoints.slice(0, selectedKeypointIndex),
      [
        typonym.keypoints[selectedKeypointIndex][0],
        {
          ...typonym.keypoints[selectedKeypointIndex][1],
          [name]: value ? Number(value) : undefined,
        },
      ],
      ...typonym.keypoints.slice(selectedKeypointIndex + 1),
    ]);
  };

  toggleParam = (name, value) => {
    const { project } = this.props;
    this.saveParam(
      name,
      value === 'on' || value === true ? project.values[name] : undefined,
    );
  };

  toggleAllParams = value => {
    const { selectedKeypointIndex } = this.state;
    const { typonym, project } = this.props;

    this.updateKeypoints([
      ...typonym.keypoints.slice(0, selectedKeypointIndex),
      [
        typonym.keypoints[selectedKeypointIndex][0],
        value
          ? {
              ...project.values,
              ...typonym.keypoints[selectedKeypointIndex][1],
            }
          : {},
      ],
      ...typonym.keypoints.slice(selectedKeypointIndex + 1),
    ]);
  };

  render() {
    const { project, typonym, font } = this.props;
    const { selectedKeypointIndex } = this.state;
    const { keypoints } = typonym;
    const currentKeypoint = keypoints[selectedKeypointIndex];

    return (
      <div className="Contextualize">
        <div className="Contextualize-curve">
          <Curve
            className="Curve"
            keypoints={keypoints}
            onChange={this.updateKeypoints}
            createKeypoint={this.createKeypoint}
            onSelectKeypoint={index =>
              this.setState({ selectedKeypointIndex: index })}
          />
          <div className="Contextualize-curve-cursor-container">
            <div
              className="Contextualize-curve-cursor"
              style={{ left: currentKeypoint[0] + '%' }}
            />
          </div>
        </div>

        <div className="Project">
          <div className="Project-name">
            <input
              id="responsive-font-input"
              className="Project-name-input"
              type="text"
              defaultValue={project.name}
              style={{ fontFamily: 'CustomFont2' }}
            />
          </div>

          <form className="Project-params ParamsList">
            <div className="Project-params-actions">
              <button
                className="Project-params-actions-button"
                onClick={e => {
                  e.preventDefault();
                  this.toggleAllParams(true);
                }}
              >
                Select All
              </button>
              <button
                className="Project-params-actions-button"
                onClick={e => {
                  e.preventDefault();
                  this.toggleAllParams(false);
                }}
              >
                Unselect All
              </button>
            </div>

            <ul className="ParamsList-list">
              {font &&
                font.json.controls
                  .reduce((acc, control) => acc.concat(control.parameters), [])
                  .map(({ name, min, max, step, init }, i) => (
                    <li key={project.id + name} className="ParamsList-item">
                      <p className="ParamsList-item-label">
                        <input
                          type="checkbox"
                          checked={typeof currentKeypoint[1][name] === 'number'}
                          onChange={e => this.toggleParam(name, e.target.value)}
                        />
                        {name}
                      </p>
                      <input
                        onChange={e => this.saveParam(name, e.target.value)}
                        className="ParamsList-item-slider"
                        type="range"
                        name={name}
                        min={min}
                        max={max}
                        step={step}
                        value={
                          typeof currentKeypoint[1][name] !== 'undefined'
                            ? currentKeypoint[1][name]
                            : project.values[name]
                        }
                      />
                    </li>
                  ))}
            </ul>
          </form>
        </div>
      </div>
    );
  }
}

export default Contextualize;

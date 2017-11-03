import React, { Component } from 'react';

import './styles.css';

class Projects extends Component {
  constructor() {
    super();

    this.state = {
      defaultValues: null,
    };
  }

  saveValues = e => {
    this.props.onChangeValues({
      ...this.state.defaultValues,
      ...this.props.project.values,
      [e.target.name]: Number(e.target.value),
    });
  };

  componentDidMount() {
    window.fitText(document.getElementById('responsive-font-input'));
  }

  componentWillReceiveProps({ font, project }) {
    if (!this.state.defaultValues && this.props.font) {
      const defaultValues = font.json.controls
        .reduce((acc, control) => acc.concat(control.parameters), [])
        .reduce((params, { name, init }) => {
          params[name] = init;
          return params;
        }, {});
      this.setState({ defaultValues });
    }
  }

  render() {
    const { project, onRenameProject, font } = this.props;

    return (
      <div className="Project">
        <div className="Project-name">
          <input
            id="responsive-font-input"
            className="Project-name-input"
            type="text"
            onChange={e => onRenameProject(e.target.value)}
            value={project.name}
          />
        </div>

        {font && (
          <form
            className="Project-params ParamsList"
            onChange={this.saveValues}
          >
            <ul className="ParamsList-list">
              {font.json.controls
                .reduce((acc, control) => acc.concat(control.parameters), [])
                .map(({ name, min, max, step, init }, i) => (
                  <li key={project.id + name} className="ParamsList-item">
                    <span className="ParamsList-item-label">{name}</span>
                    <input
                      onChange={() => {}}
                      className="ParamsList-item-slider"
                      type="range"
                      name={name}
                      min={min}
                      max={max}
                      step={step}
                      value={
                        typeof project.values[name] === 'number'
                          ? project.values[name]
                          : init
                      }
                    />
                  </li>
                ))}
            </ul>
          </form>
        )}
      </div>
    );
  }
}

export default Projects;

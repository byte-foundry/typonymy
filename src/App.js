/* global Ptypo */

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';

import './App.css';

import Projects from './Projects';
import Contextualize from './Contextualize';
import Preview from './Preview';
const NoMatch = () => <div>Oops</div>;

class ProjectList extends Component {
  render() {
    const {
      projects,
      selectedProjectIndex,
      onAddProject,
      onSelectProject,
    } = this.props;

    return (
      <div className="Projects">
        <ul className="Projects-list">
          {projects.map(({ id, name }, i) => (
            <li key={id} className="Projects-list-item">
              <a
                href="#"
                className={`Projects-list-item-link ${i === selectedProjectIndex
                  ? 'Projects-list-item-link--selected'
                  : ''}`}
                onClick={() => onSelectProject(id)}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>

        <Route
          exact
          path="/"
          render={() => (
            <button className="Projects-list-add" onClick={onAddProject}>
              Add Project
            </button>
          )}
        />
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      selectedProjectIndex: 0,
      selectedContextIndex: 0,
      projects: [],
      contexts: ['zoom', 'fontSize', 'darkness'],
      typonyms: {},
    };
  }

  async componentDidMount() {
    const prototypoFontFactory = new Ptypo.default();

    const savedProjects = JSON.parse(localStorage.getItem('projects'));

    this.setState({ loading: true });

    const font = await prototypoFontFactory.createFont(
      'CustomFont',
      Ptypo.templateNames.SPECTRAL,
    );

    this.setState({ font });

    if (!savedProjects) {
      this.addProject();
    }

    this.setState({...savedProjects, loading: false });
  }

  componentDidUpdate() {
    const {
      font,
      projects,
      contexts,
      typonyms,
      selectedProjectIndex,
    } = this.state;

    const currentProject = projects[selectedProjectIndex];
    font &&
      currentProject &&
      font.changeParams(projects[selectedProjectIndex].values);

    localStorage.setItem(
      'projects',
      JSON.stringify({
        projects,
        contexts,
        typonyms,
      }),
    );
  }

  addProject = () => {
    this.setState(state => ({
      projects: [
        ...state.projects,
        {
          id: Date.now(),
          name: 'New project',
          values: state.font.json.controls
            .reduce((acc, control) => acc.concat(control.parameters), [])
            .reduce((params, { name, init }) => {
              params[name] = init;
              return params;
            }, {}),
        },
      ],
    }));
  };

  saveValues = (selectedProjectIndex, newValues) => {
    this.setState(({ projects }) => ({
      projects: [
        ...projects.slice(0, selectedProjectIndex),
        { ...projects[selectedProjectIndex], values: newValues },
        ...projects.slice(selectedProjectIndex + 1),
      ],
    }));
  };

  renameProject = (selectedProjectIndex, newName) => {
    this.setState(({ projects }) => ({
      projects: [
        ...projects.slice(0, selectedProjectIndex),
        { ...projects[selectedProjectIndex], name: newName },
        ...projects.slice(selectedProjectIndex + 1),
      ],
    }));
  };

  selectProject = id => {
    this.setState(state => ({
      selectedProjectIndex: state.projects.findIndex(
        project => id === project.id,
      ),
    }));
  };

  saveTyponym = (typonymId, typonym) => {
    this.setState({
      typonyms: {
        ...this.state.typonyms,
        [typonymId]: typonym,
      },
    });
  };

  saveProject = () => {
    const { projects, contexts, typonyms } = this.state;

    const link = document.createElement('a');
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        projects,
        contexts,
        typonyms,
      }),
    )}`;
    link.target = '_blank';
    link.download = 'projects.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  render() {
    const {
      loading,
      font,
      projects,
      selectedProjectIndex,
      contexts,
      selectedContextIndex,
      typonyms,
    } = this.state;

    if (loading) {
      return <p>loading</p>;
    }

    const currentProject = projects[selectedProjectIndex];
    const currentContext = contexts[selectedContextIndex];
    const typonymId = currentProject.id + '-' + currentContext;
    const typonym = {
      project: currentProject.id,
      context: currentContext,
      keypoints: [[0, {}], [100, {}]],
      ...typonyms[typonymId],
    };

    return (
      <Router>
        <div className="App">
          <nav className="NavBar">
            <ul className="NavBar-list">
              <li className="NavBar-item">
                <NavLink
                  activeClassName="NavBar-item-link--selected"
                  exact
                  className="NavBar-item-link"
                  to="/"
                >
                  Projects
                </NavLink>
              </li>
              <li className="NavBar-item">
                <NavLink
                  activeClassName="NavBar-item-link--selected"
                  exact
                  className="NavBar-item-link"
                  to="/contextualize"
                >
                  Contextualize
                </NavLink>
              </li>
              <li className="NavBar-item">
                <NavLink
                  activeClassName="NavBar-item-link--selected"
                  exact
                  className="NavBar-item-link"
                  to="/preview"
                >
                  Preview
                </NavLink>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route
              path="/preview"
              render={() => (
                <Preview
                  saveProject={this.saveProject}
                  contexts={contexts}
                  projects={projects}
                  typonyms={typonyms}
                />
              )}
            />
            <Route
              path="/"
              children={() => (
                <div className="ProjectsPage">
                  <ProjectList
                    projects={projects}
                    selectedProjectIndex={selectedProjectIndex}
                    onAddProject={this.addProject}
                    onSelectProject={this.selectProject}
                  />
                  <Switch>
                    <Route
                      exact
                      path="/"
                      render={() => (
                        <Projects
                          font={font}
                          project={currentProject}
                          onChangeValues={newValues =>
                            this.saveValues(selectedProjectIndex, newValues)}
                          onRenameProject={newName =>
                            this.renameProject(selectedProjectIndex, newName)}
                        />
                      )}
                    />
                    <Route
                      path="/contextualize"
                      render={() => (
                        <div className="Main">
                          <div
                            key="context-selector"
                            className="ContextSelector"
                          >
                            <select
                              value={currentContext}
                              onChange={e =>
                                this.setState({
                                  selectedContextIndex:
                                    contexts.findIndex(
                                      c => c === e.target.value,
                                    ) || 0,
                                })}
                            >
                              {contexts.map((name, i) => (
                                <option value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <Contextualize
                            key="typonym"
                            font={font}
                            project={currentProject}
                            context={currentContext}
                            typonym={typonym}
                            updateTyponym={typonym =>
                              this.saveTyponym(typonymId, typonym)}
                          />
                        </div>
                      )}
                    />
                    <Route component={NoMatch} />
                  </Switch>
                </div>
              )}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

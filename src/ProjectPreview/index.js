/* global Ptypo */

import React, { Component } from 'react';

import './styles.css';

class ProjectPreview extends Component {
  constructor() {
    super();

    this.state = {
      font: null,
    };
  }

  async componentDidMount() {
    const prototypoFontFactory = new Ptypo.default();

    this.setState({ loading: true });

    const font = await prototypoFontFactory.createFont(
      'CustomFont-' + this.props.id,
      Ptypo.templateNames.SPECTRAL,
    );

    font.changeParams(this.props.values);

    this.setState(state => ({ font, loading: false }));
  }

  componentWillReceiveProps(nextProps) {
    this.state.font && this.state.font.changeParams(nextProps.values);
  }

  render() {
    const {loading} = this.state;
    const { id, name, className } = this.props;

    if (loading) {
      return <p className={'ProjectPreview ProjectPreview--loading ' + className}>loading...</p>;
    }

    return (
      <p
        className={'ProjectPreview ' + className}
        style={{ fontFamily: 'CustomFont-' + id }}
      >
        {name}
      </p>
    );
  }
}

export default ProjectPreview;

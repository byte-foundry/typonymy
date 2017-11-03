import React, { Component } from 'react';

import './styles.css';

class Curve extends Component {
  moveKeypoint = (e, index) => {
    if (
      this.props.keypoints[index][0] <= 0 ||
      this.props.keypoints[index][0] >= 100
    ) {
      return;
    }

    const leftpx = e.pageX - e.target.parentElement.offsetLeft;
    const left = Math.round(
      leftpx / e.target.parentElement.getBoundingClientRect().width * 100,
    );

    if (left < 0 || left > 100) {
      return;
    }

    this.props.onChange(
      this.props.keypoints.map((keypoint, i) => {
        if (i === index && !this.props.keypoints.some(k => k[0] === left)) {
          return [left, keypoint[1]];
        }

        return keypoint;
      }),
    );
  };

  createKeypoint = e => {
    const leftpx = e.pageX - e.target.offsetLeft;
    const left = Math.round(leftpx / e.target.getBoundingClientRect().width * 100);

    if (this.props.keypoints.some(k => k[0] === left)) {
      return;
    }

    this.props.createKeypoint(left);
  };

  removeKeypoint = index => {
    this.props.onChange(this.props.keypoints.filter((_, i) => i !== index));
  };

  render() {
    const { className, keypoints, onSelectKeypoint } = this.props;

    return (
      <div className={className}>
        <div className="Curve-line" onClick={this.createKeypoint}>
          {keypoints.map(([position, values], index) => (
            <div
              key={index}
              className="Curve-line-keypoint"
              style={{ left: position + '%' }}
              onDragStart={(e) => e.dataTransfer.setDragImage(document.createElement('div'), 0, 0)}
              onDrag={e => this.moveKeypoint(e, index)}
              onClick={e => {
                e.stopPropagation();
                return onSelectKeypoint(index);
              }}
              draggable="true"
            >
              <div className="Curve-line-keypoint-position">{position}</div>
              {position !== 0 &&
                position !== 100 && (
                  <div
                    className="Curve-line-keypoint-delete"
                    onClick={e => this.removeKeypoint(index)}
                  >
                    &times;
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Curve;

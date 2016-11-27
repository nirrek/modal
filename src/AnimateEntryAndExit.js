import React from 'react';

export default class AnimateEntryAndExit extends React.Component {
  state = {
    isEntering: false,
    isLeaving: false,
  };

  componentDidMount() {
    this._isMounted = true;
    if (this.props.show) this.enter();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isEntering || this.state.isExiting) {
      this.enqueuedTransition = nextProps.show;
    } else if (this.props.show && !nextProps.show) {
      this.exit();
    } else if (!this.props.show && nextProps.show) {
      this.enter();
    }
  }

  enter() {
    this.setState({ isEntering: true });
    window.setTimeout(() => {
      if (!this._isMounted) return;
      this.setState({ isEntering: false });
      this.handleEnqueuedTransition();
    }, this.props.enterDuration);
  }

  exit() {
    this.setState({ isExiting: true });
    window.setTimeout(() => {
      if (!this._isMounted) return;
      this.setState({ isExiting: false });
      this.handleEnqueuedTransition();
    }, this.props.exitDuration)
  }

  handleEnqueuedTransition() {
    if (this.enqueuedTransition === undefined) return;
    const shouldEnter = this.enqueuedTransition;
    this.enqueuedTransition = undefined;
    if (shouldEnter) this.enter();
    else             this.exit();
  }

  render() {
    if (this.state.isEntering || this.state.isExiting) {
      return this.props.children(this.state.isEntering, this.state.isExiting)
    } else if (this.props.show) {
      return this.props.children(false, false)
    } else {
      return null;
    }
  }
}

import React from 'react';
import { StyleSheet, css } from 'aphrodite';

export default class AnimTest extends React.Component {
  state = {
    show: true,
  }

  render() {
    return (
      <div style={{ background: '#eee', height: '100vh', }}>
        <button onClick={() => this.setState(state => ({ show: !state.show }))}>Show/Hide</button>
        {/* <Card show={this.state.show} /> */}

        <AnimateEntryAndExit
          show={this.state.show}
          enterDuration={300}
          exitDuration={300}
        >
          {(isEntering, isExiting) => (
            <div className={css(cs.card, isEntering && cs.in, isExiting && cs.out)}>
              Card
            </div>
          )}
        </AnimateEntryAndExit>
      </div>
    )
  }
}

const scaleInKeyframes = {
  '0%': { transform: 'scale(0)' },
  '100%': { transform: 'scale(1)' },
}

const scaleOutKeyframes = {
  '100%': { transform: 'scale(0)' },
  '0%': { transform: 'scale(1)' },
}

const cs = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0, .3)',
    borderRadius: 2,
    background: 'white',
  },
  in: {
    animationName: scaleInKeyframes,
    animationDuration: '300ms',
    animationFillMode: 'forwards',
  },
  out: {
    animationName: scaleOutKeyframes,
    animationDuration: '300ms',
    animationFillMode: 'forwards',
  }
});
class Card extends React.Component {
  state = {
    isVisible: this.props.show,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.show === nextProps.show) return;

    if (this.props.show && !nextProps.show) {
      console.log('delay removal somehow')
      this.setState({ out: true });
      window.setTimeout(() => this.setState({ isVisible: false }), 300);
    } else {
      this.setState({ isVisible: true, out: false });
    }
  }

  render() {
    return this.state.isVisible && (
      <div className={css(cs.card, this.state.out && cs.out)}>
        Card
      </div>
    )
  }
}

// Note this does not support changing the durations dynamically.
class AnimateEntryAndExit extends React.Component {
  state = {
    isEntering: false,
    isLeaving: false,
  };

  componentDidMount() {
    if (this.props.show) this.enter();
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
      this.setState({ isEntering: false });
      this.handleEnqueuedTransition();
    }, this.props.enterDuration);
  }

  exit() {
    this.setState({ isExiting: true });
    window.setTimeout(() => {
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


{/* <AnimateEntryAndRemoval show={true} enterDuration={300} exitDuration={300}>
  {(isEntering, isExiting) => {
    <div className={css(
      isEntering && cs.in,  // adds the class with the in animation
      isExiting && cs.out, // adds the class with the out animation
    )}>
      something
    </div>
  }}
</AnimateEntryAndRemoval> */}

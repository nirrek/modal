import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { StyleSheet, css } from 'aphrodite';
import { curry } from 'ramda';
import AnimateEntryAndExit from './AnimateEntryAndExit.js';

const hasAncestor = curry((ancestor, node) => {
  while (node) {
    if (node === ancestor) return true;
    node = node.parentElement;
  }
  return false;
});

// Determines if a given HTMLElement is
var isScrollAtBottom = element =>
  (element.scrollTop + element.clientHeight) === element.scrollHeight;

var isScrollAtTop = element => element.scrollTop === 0;

const willScrollElement = (dy, element) => {
  if      (dy < 0) return !isScrollAtTop(element);
  else if (dy > 0) return !isScrollAtBottom(element);
  else             return true;
}

const isScrollableVertically = element => element.clientHeight !== element.scrollHeight;

const fadeInKeyframes = {
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
};

const scaleInKeyframes = {
  '0%': { transform: 'scale(0.8)' },
  '100%': { transform: 'scale(1)' },
}

const fadeOutKeyframes = {
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
};

const scaleOutKeyframes = {
  '0%': { transform: 'scale(1)' },
  '100%': { transform: 'scale(0.8)' },
}

const styles = StyleSheet.create({
  preventScroll: {
    overflow: 'hidden',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayEnter: {
    animationName: fadeInKeyframes,
    animationDuration: '300ms',
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
  },
  overlayExit: {
    animationName: fadeOutKeyframes,
    animationDuration: '300ms',
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 2,
    // boxShadow: '0 15px 45px rgba(0,0,0, .2), 0 5px 15px rgba(0,0,0, .3)',
    maxWidth: 768,
    margin: '0 auto',
  },
  boxEnter: {
    animationName: [fadeInKeyframes, scaleInKeyframes],
    animationDuration: '300ms',
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
  },
  boxExit: {
    animationName: [fadeOutKeyframes, scaleOutKeyframes],
    animationDuration: '300ms',
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
  },
  scrollingContainer: {
    overflowY: 'auto',
    padding: 10,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  },
  modalTitle: {
    fontSize: 22,
    padding: '30px 25px 0 25px',
  },
  modalBody: {
    padding: 25,
  },
  modalFooter: {
    padding: 25,
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: Function;
};

// TODO consider doing named export ModalPortal as Modal
export default class ModalPortal extends React.Component {
  componentDidMount() {
    if (!this.props.isOpen) return;
    this.openModal(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if      (nextProps.isOpen && !this.props.isOpen) this.openModal(nextProps);
    else if (!nextProps.isOpen && this.props.isOpen) this.closeModal(nextProps);
    else                                             this.updateModal(nextProps);
  }

  componentWillUnmount() {
    this.closeModal();
  }

  // Accepts props so it can be `this.props` or `nextProps`
  openModal = (props) => {
    const portalNode = this.portalNode = document.createElement('div');
    // portalNode.classList.add(css(styles.overlay));
    this.renderModalIntoPortal(portalNode, props);
    document.body.appendChild(portalNode);
    // This is for legacy Mathspace. It forces scroll on <html> instead of <body>
    document.body.parentElement.classList.add(css(styles.preventScroll));
    document.body.classList.add(css(styles.preventScroll));
  }

  closeModal = (props) => {
    this.updateModal(props);
    window.setTimeout(() => {
      unmountComponentAtNode(this.portalNode)
      document.body.removeChild(this.portalNode);
      // This is for legacy Mathspace. It forces scroll on <html> instead of <body>
      document.body.parentElement.classList.remove(css(styles.preventScroll));
      document.body.classList.remove(css(styles.preventScroll));
    }, 300); // hard-binding to animation duration in Modal
  }

  updateModal = (props) => {
    this.renderModalIntoPortal(this.portalNode, props);
  }

  renderModalIntoPortal = (portalNode, props) => render(<Modal {...props} />, portalNode);

  render() { return null; }
}

class Modal extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleClick = event => {
    if (!hasAncestor(this.modal, event.target)) {
      this.props.onClose();
    }
  }

  handleKeyDown = event => {
    if (event.keyCode === 27) { // Esc
      event.preventDefault();
      this.props.onClose();
    }
  }

  render() {
    return (
      <AnimateEntryAndExit show={this.props.isOpen} enterDuration={300} exitDuration={300}>
        {(isEntering, isExiting) => (
          <div
            className={css(
              styles.overlay,
              isEntering && styles.overlayEnter,
              isExiting && styles.overlayExit,
            )}
            onClick={this.handleClick}
          >
            <div className={css(styles.scrollingContainer)}>
              <div id='modal'
                ref={node => { this.modal = node; }}
                className={css(
                  styles.box,
                  isEntering && styles.boxEnter,
                  isExiting && styles.boxExit,
                )}
              >
                {this.props.title && (
                  <div className={css(styles.modalTitle)}>{this.props.title}</div>
                )}
                {this.props.children}
              </div>
            </div>
          </div>
        )}
      </AnimateEntryAndExit>
    )
  }
}

export const ModalBody = ({ children }) =>
  <div className={css(styles.modalBody)}>{children}</div>;

export const ModalFooter = ({ children }) =>
  <div className={css(styles.modalFooter)}>{children}</div>;

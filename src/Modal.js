import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { StyleSheet, css } from 'aphrodite';
import { curry } from 'ramda';

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
  '0%': { transform: 'scale(0.2)' },
  '100%': { transform: 'scale(1)' },
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    animationName: fadeInKeyframes,
    animationDuration: '300ms',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 2,
    boxShadow: '0 15px 45px rgba(0,0,0, .2), 0 5px 15px rgba(0,0,0, .3)',
    maxWidth: 768,
    margin: '0 auto',
    animationName: [fadeInKeyframes, scaleInKeyframes],
    animationDuration: '300ms',
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
    else if (!nextProps.isOpen && this.props.isOpen) this.closeModal();
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
  }

  closeModal = () => {
    unmountComponentAtNode(this.portalNode)
    document.body.removeChild(this.portalNode);
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

    // DOMMouseScroll is fired in Firefox
    // mousewheel is fired in Chrome, Safari
    // touchmove is fired on mobile devices
    // No idea what 'scroll' is fired on though
    for (const event of ['mousewheel', 'DOMMouseScroll', 'touchmove', 'scroll']) {
      document.body.addEventListener(event, e => {
        console.log('body event', e);
      });

      document.addEventListener(event, e => {
        console.log('document event', e);
      })

      // document.body.addEventListener(event, (e) => {
      //   console.log(event, e.target.id, e);
      //
      //   console.log('will scroll modal?', willScrollElement(e.deltaY, this.modal));
      //
      //   if (!willScrollElement(e.deltaY, this.modal)) {
      //     e.preventDefault();
      //   }
      //
      //   // if (!hasAncestor(this.modal, e.target)) {
      //   //   e.preventDefault();
      //   //   e.stopPropagation();
      //   // }
      // });
    }
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
      <div className={css(styles.overlay)} onClick={this.handleClick}>
        <div className={css(styles.scrollingContainer)}>
          <div id='modal'
            ref={node => { this.modal = node; }}
            className={css(styles.box)}
          >
            {this.props.title && (
              <div className={css(styles.modalTitle)}>{this.props.title}</div>
            )}
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

export const ModalBody = ({ children }) =>
  <div className={css(styles.modalBody)}>{children}</div>;

export const ModalFooter = ({ children }) =>
  <div className={css(styles.modalFooter)}>{children}</div>;

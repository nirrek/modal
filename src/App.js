import React from 'react';
import ModalPortal, { ModalBody, ModalFooter } from './Modal.js';
import { range, map } from 'ramda';
import AnimTest from './AnimTest.js';

export default class App extends React.Component {
  state = {
    numModals: 1,
    text: 'the original and the best',
    isOpen: true,
  }

  componentDidMount() {
    // window.setTimeout(() => {
    //   this.setState({ display: false })
    // }, 1000)
  }

  toggleText = () => {
    this.setState(state => ({
      text: state.text === 'the original and the best'
        ? 'super replacement'
        : 'the original and the best',
    }));
  }

  addModal = () => {
    this.setState(state => ({ numModals: state.numModals + 1 }));
  }

  closeModal = () => {
    this.setState(state => ({ numModals: Math.max(0, state.numModals - 1)}));
  }

  toggleModal = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  }

  render() {
    return (
      <div
        style={{ height: 3000 }}
      >
        {/* <AnimTest /> */}
        <button onClick={this.toggleModal}>Toggle Modal</button>
        <button onClick={this.addModal}>Add Modal</button>

        <ModalPortal
          title="This is an awesome title"
          isOpen={this.state.isOpen}
          onClose={() => this.setState({ isOpen: false })}
        >
          <ModalBody>
            <div style={{height: 100, overflowY: 'scroll' }}>
              {range(0, 20).map((val) => (
                <div key={val}>
                  This is a custom one by itself. This is a custom one by itself
                  <input type="text" />
                </div>
              ))}
            </div>
            {range(0, 50).map((val) => (
              <div key={val}>
                This is a custom one by itself. This is a custom one by itself
                <input type="text" />
              </div>
            ))}
          </ModalBody>
          <ModalFooter>
            <button onClick={this.toggleModal}>Toggle Modal</button>
          </ModalFooter>
        </ModalPortal>

        {map(i => (
          <ModalPortal isOpen={true}>
            {i}: {this.state.text}
            <button onClick={this.toggleText}>Toggle Text</button>
            <button onClick={this.addModal}>Add Modal</button>
            <button onClick={this.closeModal}>Close Modal</button>
          </ModalPortal>
        ), range(0, this.state.numModals - 1))}
      </div>
    )
  }
}

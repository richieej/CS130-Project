import React from "react";
import Modal from 'react-modal';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: 'Concert One', sans-serif;
    text-transform: uppercase;
    padding: 10px;
`

const CloseButton = styled.button`
    font-size: 12px;
    margin-top: 15px;
    width: 20px;
    height: 20px;
    border: 1px solid black;
    background: white;
    border-radius: 25px;
    font-family: 'Concert One', sans-serif;
    position: fixed;
    top: -10px;
    right: 5px;
    cursor: pointer;
`

const PopUpModal = ({ isOpen, closeModal, success, successText, errorText }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: success ? 'green' : 'red',
          borderRadius: '15px',
        },
      }}
    >
      <Container>
        {success ? successText : errorText}
        <CloseButton onClick={() => closeModal()}>X</CloseButton>
      </Container>
    </Modal>
  )
}

export default PopUpModal;

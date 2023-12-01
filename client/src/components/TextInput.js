import React  from "react";
import styled from 'styled-components';

const Form = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`

const Label = styled.label`
    font-size: 20px;
`

const Input = styled.input`
  margin-top: 10px;
  border-radius: 5px;
  border: none;
  padding: 10px;
`

const TextInput = ({ value, label, name, placeholder, onChange }) => (
  <Form className="form-group">
    {label && <Label htmlFor="input-field">{label}:</Label>}
    <Input
      type="text"
      value={value}
      name={name}
      className="form-control"
      placeholder={placeholder}
      onChange={onChange}
    />
  </Form>
);

export default TextInput;

import React from "react";
import classes from "./Modal.module.scss";

const Modal = (props: any) => {
  return (
    <div
      onClick={() => {
        props.onClose ? props.onClose() : {};
      }}
      className={`${classes.backdrop}`}
    >
      {props.children}
    </div>
  );
};

export default Modal;

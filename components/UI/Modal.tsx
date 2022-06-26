import React from "react";
import classes from "./Modal.module.scss";

const Modal = (props: any) => {
  return <div className={`${classes.backdrop}`}>{props.children}</div>;
};

export default Modal;

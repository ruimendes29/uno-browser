import React from "react";
import classes from "./Button.module.scss";

const Button = (props: {
  onClick: any;
  children: any;
  className?: string;
  style?: any;
}) => {
  return (
    <button
      style={props.style ? { ...props.style } : {}}
      className={`${props.className} ${classes.button}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;

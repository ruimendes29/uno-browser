import React, { Fragment } from "react";
import classes from "./Button.module.scss";

const Button = (props: {
  onClick: any;
  children: any;
  className?: string;
  style?: any;
  noEffect?: boolean;
}) => {
  return (
    <button
      style={props.style ? { ...props.style } : {}}
      className={`${props.className} ${classes.button}`}
      onClick={props.onClick}
    >
      {props.children}
      {!props.noEffect && (
        <Fragment>
          <div
            style={{ backgroundColor: "red" }}
            className={`${classes.square} ${classes.red}`}
          ></div>
          <div
            style={{ backgroundColor: "blue" }}
            className={`${classes.square} ${classes.blue}`}
          ></div>
          <div
            style={{ backgroundColor: "green" }}
            className={`${classes.square} ${classes.green}`}
          ></div>
          <div
            style={{ backgroundColor: "yellow" }}
            className={`${classes.square} ${classes.yellow}`}
          ></div>
        </Fragment>
      )}
    </button>
  );
};

export default Button;

import React, { Fragment } from "react";
import classes from "./CardUI.module.scss";

const CardUI = (props: {
  className?: string;
  children?: any;
  title?: string;
}) => {
  return (
    <div onClick={(e)=>{e.stopPropagation()}} className={`${props.className} ${classes.card}`}>
      {props.title ? (
        <div className={`${classes.title}`}>{props.title}</div>
      ) : (
        ""
      )}
      {props.children}
    </div>
  );
};

export default CardUI;

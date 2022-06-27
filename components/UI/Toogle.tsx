import React from "react";
import classes from "./Toogle.module.scss";

const Toogle = (props: { onSelection: any; selected: boolean }) => {
  console.log(props.selected);
  return (
    <div
      onClick={(e) => {
        console.log("uu")
        props.onSelection();
        e.stopPropagation();
      }}
      className={`${classes.toogle} ${props.selected ? classes.selected : ""}`}
    ></div>
  );
};

export default Toogle;

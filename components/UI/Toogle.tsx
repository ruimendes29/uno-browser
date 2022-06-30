import React from "react";
import classes from "./Toogle.module.scss";

const Toogle = (props: { onSelection: any; selected: boolean }) => {
  
  return (
    <div
      onClick={(e) => {
        
        props.onSelection();
        e.stopPropagation();
      }}
      className={`${classes.toogle} ${props.selected ? classes.selected : ""}`}
    ></div>
  );
};

export default Toogle;

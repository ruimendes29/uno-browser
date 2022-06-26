import React, { Fragment } from "react";
import CardUI from "../../UI/CardUI";
import classes from "./ChooseColor.module.scss";

const ChooseColor = (props: { onColorChose: any }) => {
  const colors = ["red", "blue", "green", "yellow"];
  return (
    <CardUI title="Choose the next color:">
      <div className={`${classes["colors-wrapper"]}`}>
        {colors.map((color: string) => (
          <div
            key={color}
            style={{ backgroundColor: color }}
            className={`${classes.option}`}
            onClick={() => {
              props.onColorChose(color);
            }}
          >
            {color[0].toUpperCase() + color.slice(1)}
          </div>
        ))}
      </div>
    </CardUI>
  );
};

export default ChooseColor;

import React from "react";
import Card from "./Card/Card";
import classes from "./OpponentSeat.module.scss";

/** Compact stand-in for an opponent's hand on small screens. */
const OpponentSeat = (props: {
  name: string;
  cardCount: number;
  myTurn: boolean;
}) => {
  return (
    <div className={`${classes.seat} ${props.myTurn ? classes.turn : ""}`}>
      <div className={classes.mini}>
        <Card identifier="back" />
      </div>
      <div className={classes.info}>
        <span className={classes.name}>{props.name || "Player"}</span>
        <span className={classes.count}>{props.cardCount}</span>
      </div>
    </div>
  );
};

export default OpponentSeat;

import { initializeApp } from "firebase/app";
import router from "next/router";
import React from "react";
import { firebaseConfig } from "../../store/config";
import Card from "./Card/Card";
import ICard from "./Card/ICard";
import { drawFromDeck, handleTake } from "./GameUtils";
import classes from "./Playground.module.scss";

const Playground = (props: {
  className?: string;
  myTurn: boolean;
  cantPlay: boolean;
  topCard: ICard;
  take: number;
  rules: {
    takeUntilPlay: boolean;
    canPlayMultiple: boolean;
    canPlayOverTake: boolean;
    endWhenOneEnds: boolean;
  }
}) => {
  return (
    <div className={`${props.className} ${classes.playground}`}>
      <div className={`${classes["cards-wrapper"]}`}>
        <Card
          onClick={() => {
            if (props.cantPlay && props.take === 0) {
              drawFromDeck(
                initializeApp(firebaseConfig),
                router.query.gameId,
                localStorage.getItem("player")!,
                props.rules
              );
            }
          }}
          className={`${
            props.cantPlay && props.take === 0
              ? classes.unplayable + " arrow-pointer"
              : ""
          }`}
          identifier={"back"}
          color={props.topCard.color}
        />
        <Card
          className={`${classes["top-card"]}`}
          identifier={props.topCard.identifier}
          color={props.topCard.color}
        />
      </div>

      {props.take > 0 && props.myTurn && (
        <button
          onClick={() => {
            handleTake(
              initializeApp(firebaseConfig),
              router.query.gameId,
              localStorage.getItem("player")!,
              props.take
            );
          }}
          className={`${props.cantPlay ? "arrow-pointer" : ""} ${
            classes.taker
          }`}
        >
          Take {props.take}
        </button>
      )}
    </div>
  );
};

export default Playground;

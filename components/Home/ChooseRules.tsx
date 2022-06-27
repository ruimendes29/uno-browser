import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Button from "../UI/Button";
import CardUI from "../UI/CardUI";
import Toogle from "../UI/Toogle";
import classes from "./ChooseRules.module.scss";

const ChooseRules = (props: { roomId: string; onStart: any }) => {
  const [canPlayMultiple, setCanPlayMultiple] = useState(false);
  const [takeUntilPlay, setTakeUntilPlay] = useState(false);
  const [canPlayOverTake, setCanPlayOverTake] = useState(false);
  const [endWhenOneEnds, setEndWhenOneEnds] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <CardUI title="Choose the rules">
      <div className={`${classes.rule}`}>
        <Toogle
          selected={canPlayMultiple}
          onSelection={() => {
            setCanPlayMultiple((b) => !b);
          }}
        />
        <h3 className={`${classes.text}`}>
          Cards with the same identifier can be played together
        </h3>
      </div>
      <div className={`${classes.rule}`}>
        <Toogle
          selected={canPlayOverTake}
          onSelection={() => {
            setCanPlayOverTake((b) => !b);
          }}
        />
        <h3 className={`${classes.text}`}>
          {`Can play "+2" or "+4" on top of each other`}
        </h3>
      </div>
      <div className={`${classes.rule}`}>
        <Toogle
          selected={takeUntilPlay}
          onSelection={() => {
            setTakeUntilPlay((b) => !b);
          }}
        />
        <h3 className={`${classes.text}`}>
          Player draws cards from deck until he is able to play
        </h3>
      </div>
      <div className={`${classes.rule}`}>
        <Toogle
          selected={endWhenOneEnds}
          onSelection={() => {
            setEndWhenOneEnds((b) => !b);
          }}
        />
        <h3 className={`${classes.text}`}>Game ends when one player ends</h3>
      </div>
      <div className={`${classes.code}`}>
        <div className={`${classes.room}`}> {props.roomId}</div>

        <FontAwesomeIcon
          className={`${classes.icon}`}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard
              .writeText(props.roomId)
              .then(() => {
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 1000);
              })
              .catch(() => {
                console.error("Couldnt copy!");
              });
          }}
          icon={faCopy}
        />
      </div>

      <h3 className={`${copied ? classes.visible : ""} ${classes.copy}`}>
        Room id copied to clipboard!
      </h3>
      <Button
        onClick={() => {
          props.onStart({
            takeUntilPlay,
            canPlayMultiple,
            canPlayOverTake,
            endWhenOneEnds,
          });
        }}
      >
        Start Game
      </Button>
    </CardUI>
  );
};

export default ChooseRules;

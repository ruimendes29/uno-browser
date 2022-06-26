import React, { useCallback, useEffect, useState } from "react";
import Card from "./Card/Card";
import ICard from "./Card/ICard";
import classes from "./Hand.module.scss";

const Hand = (props: {
  cards: any[];
  onPlay?: Function;
  className?: string;
  vertical?: boolean;
}) => {
  const [translateValue, setTranslateValue] = useState(0);

  const updateTranslateValue = useCallback(
    (cardsInHand: number) => {
      const cardWidth = 8 * Math.min(16, 0.05 * window.innerWidth);
      const cardHeight = 15 * Math.min(16, 0.05 * window.innerWidth);
      const handSize = props.vertical
        ? Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.7)
        : Math.floor(window.innerWidth * 0.7);
      const spaceForOtherCards =
        handSize - (props.vertical ? cardHeight : cardWidth);
      const otherCards = cardsInHand - 1;
      const numberOfCards =
        spaceForOtherCards / (props.vertical ? cardHeight : cardWidth);
      const tv =
        otherCards > numberOfCards
          ? spaceForOtherCards / otherCards
          : props.vertical
          ? cardHeight
          : cardWidth;
      setTranslateValue(Math.ceil(tv));
    },
    [props.vertical]
  );

  useEffect(() => {
    if (props.cards) {
      addEventListener("resize", () => {
        updateTranslateValue(props.cards.length);
      });
      updateTranslateValue(props.cards.length);
    }
  }, [updateTranslateValue, props.cards]);

  return (
    <div className={`${props.className} ${classes.hand}`}>
      {props.cards && props.cards.map((card: ICard, index: number) => {
        return (
          <Card
            onClick={
              props.onPlay
                ? () => {
                    props.onPlay!(card);
                  }
                : () => {}
            }
            style={{
              position: "absolute",
              zIndex: index,
              ...(index < props.cards.length - 1
                ? {
                    ...(props.vertical
                      ? {
                          top: Math.floor(translateValue * index),
                        }
                      : { left: Math.floor(translateValue * index) + "px" }),
                  }
                : {
                    ...(props.vertical
                      ? { top: Math.floor(translateValue * index) }
                      : { left: Math.floor(translateValue * index) + "px" }),
                  }),
            }}
            key={card.id+"_"+card.identifier+"_"+card.color}
            identifier={card.identifier}
            color={card.color}
          />
        );
      })}
    </div>
  );
};

export default Hand;

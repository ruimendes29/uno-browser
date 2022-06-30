import React, { useCallback, useEffect, useState } from "react";
import Card from "./Card/Card";
import ICard from "./Card/ICard";
import classes from "./Hand.module.scss";

const Hand = (props: {
  cards: any[];
  onPlay?: Function;
  className?: string;
  mine?: boolean;
  myTurn:boolean;
  canPlayMultiple?: boolean;
  selected?: ICard[];
  style?: any;
}) => {
  const [translateValue, setTranslateValue] = useState(0);

  const updateTranslateValue = useCallback(
    (cardsInHand: number) => {
      const em1 = Math.min(
        16,
        0.02 * Math.min(window.innerWidth, window.innerHeight)
      );
      const cardWidth = 8 * em1;
      const cardHeight = 11.2 * em1;
      const handSize = !props.mine
        ? 0.6 * Math.min(window.innerHeight, window.innerWidth)
        : 0.8 * window.innerWidth;
      const spaceForOtherCards = handSize - cardWidth;
      const otherCards = cardsInHand - 1;
      const numberOfCards = spaceForOtherCards / cardWidth;
      const tv =
        otherCards > numberOfCards
          ? spaceForOtherCards / otherCards
          : cardWidth;
      setTranslateValue(Math.ceil(tv));
    },
    [props.mine]
  );

  const handlePlayedCard = (card: ICard) => {
    if (props.onPlay) {
      props.onPlay(card);
    }
  };

  useEffect(() => {
    if (props.cards) {
      addEventListener("resize", () => {
        updateTranslateValue(props.cards.length);
      });
      updateTranslateValue(props.cards.length);
    }
  }, [updateTranslateValue, props.cards]);

  

  return (
    <div style={props.style} className={`${props.className} ${props.myTurn?classes.turn:''} ${classes.hand}`}>
      {props.cards &&
        props.cards.map((card: ICard, index: number) => {
          return (
            <Card
              onClick={() => {
                handlePlayedCard(card);
              }}
              style={{
                ...(props.selected && props.selected.includes(card)
                  ? { top: "-50%" }
                  : {}),
                position: "absolute",
                zIndex: index,
                left: Math.floor(translateValue * index) + "px",
              }}
              key={card.id + "_" + card.identifier + "_" + card.color}
              identifier={card.identifier}
              color={card.color}
            />
          );
        })}
    </div>
  );
};

export default Hand;

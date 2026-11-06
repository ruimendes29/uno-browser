import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "../UI/Button";
import Card from "./Card/Card";
import ICard from "./Card/ICard";
import classes from "./Hand.module.scss";

const Hand = (props: {
  cards: any[];
  onPlay?: Function;
  className?: string;
  mine?: boolean;
  compact?: boolean;
  myTurn: boolean;
  canPlayMultiple?: boolean;
  clickedGroup?:any;
  grouping?:{active:boolean,cards:ICard[]}
  selected?: ICard[];
  style?: any;
  name:string
}) => {
  const [translateValue, setTranslateValue] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const updateTranslateValue = useCallback(
    (cardsInHand: number) => {
      if (props.compact && scrollerRef.current) {
        // spread the cards over the available width, but keep enough of each
        // one visible to tap it: past that point the hand scrolls sideways
        const styles = getComputedStyle(scrollerRef.current);
        const em = parseFloat(styles.fontSize);
        const cardWidth = 8 * em;
        const available =
          scrollerRef.current.clientWidth -
          parseFloat(styles.paddingLeft) -
          parseFloat(styles.paddingRight);
        const otherCards = Math.max(cardsInHand - 1, 1);
        setTranslateValue(
          Math.max(
            3.4 * em,
            Math.min(cardWidth + 0.4 * em, (available - cardWidth) / otherCards)
          )
        );
        return;
      }
      const em1 = Math.min(
        16,
        0.02 * Math.min(window.innerWidth, window.innerHeight)
      );
      const cardWidth = 8 * em1;
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
    [props.mine, props.compact]
  );

  const handlePlayedCard = (card: ICard) => {
    if (props.onPlay) {
      props.onPlay(card);
    }
  };

  useEffect(() => {
    if (props.cards) {
      const onResize = () => {
        updateTranslateValue(props.cards.length);
      };
      addEventListener("resize", onResize);
      updateTranslateValue(props.cards.length);
      return () => removeEventListener("resize", onResize);
    }
  }, [updateTranslateValue, props.cards]);

  const groupButton = props.myTurn && props.canPlayMultiple && (
    <Button
      noEffect
      style={{
        backgroundColor: props.grouping && props.grouping.active ? "green" : "darkblue",
      }}
      className={`${classes.group}`}
      onClick={() => {
        props.clickedGroup();
      }}
    >
      {props.grouping!.active
        ? props.grouping!.cards.length > 0
          ? "Play"
          : "Select"
        : "Group"}
    </Button>
  );

  const cards =
    props.cards &&
    props.cards.map((card: ICard, index: number) => {
      return (
        <Card
          onClick={() => {
            handlePlayedCard(card);
          }}
          style={{
            ...(props.selected && props.selected.includes(card)
              ? { top: "-10%" }
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
    });

  if (props.compact) {
    const cardCount = props.cards ? props.cards.length : 0;
    return (
      <div className={`${classes.compact} ${props.myTurn ? classes.turn : ""}`}>
        <div className={`${classes.header}`}>
          <span className={`${classes.name}`}>{props.name}</span>
          {props.myTurn && <span className={`${classes.badge}`}>Your turn</span>}
          {groupButton}
        </div>
        <div ref={scrollerRef} className={`${classes.scroller}`}>
          <div
            className={`${classes.track}`}
            style={{
              width: `calc(8em + ${
                translateValue * Math.max(cardCount - 1, 0)
              }px)`,
            }}
          >
            {cards}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={props.style}
      className={`${props.className} ${props.myTurn ? classes.turn : ""} ${
        classes.hand
      }`}
    >
      <h1 className={`${classes.name}`}>{props.name}</h1>
      {groupButton}
      {cards}
    </div>
  );
};

export default Hand;

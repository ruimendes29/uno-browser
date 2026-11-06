import React from "react";
import classes from "./Card.module.scss";

// Line icons are drawn twice (a wider black stroke underneath) so they keep a
// dark outline and stay readable on every card colour, yellow included.
const LineIcon = (props: { children: React.ReactNode }) => (
  <svg
    className={classes.icon}
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <g stroke="#000" strokeWidth={5}>
      {props.children}
    </g>
    <g stroke="currentColor" strokeWidth={2.8}>
      {props.children}
    </g>
  </svg>
);

const ForbidIcon = () => (
  <LineIcon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6 18 18" />
  </LineIcon>
);

const reverseArrow = "M4 11.4A8 8 0 0 1 18 6.7M18.6 2.4 18 6.7 13.7 6.3";

const ReverseIcon = () => (
  <LineIcon>
    <path d={reverseArrow} />
    <path d={reverseArrow} transform="rotate(180 12 12)" />
  </LineIcon>
);

const ChooseIcon = () => (
  <svg
    className={classes.icon}
    viewBox="0 0 24 24"
    stroke="#000"
    strokeWidth={0.7}
    aria-hidden="true"
  >
    <g transform="rotate(30 12 12)">
      <path fill="red" d="M12 12V1.5A7.5 10.5 0 0 0 4.5 12Z" />
      <path fill="blue" d="M12 12V1.5A7.5 10.5 0 0 1 19.5 12Z" />
      <path fill="green" d="M12 12H4.5A7.5 10.5 0 0 0 12 22.5Z" />
      <path fill="yellow" d="M12 12H19.5A7.5 10.5 0 0 1 12 22.5Z" />
    </g>
  </svg>
);

const ICONS: { [identifier: string]: React.FC } = {
  choose: ChooseIcon,
  forbid: ForbidIcon,
  reverse: ReverseIcon,
};

const Card = (props: {
  onClick?: any;
  style?: any;
  id?: string;
  className?: string;
  identifier: number | string;
  color?: string;
}) => {
  const identifier = props.identifier + "";
  const isBack = identifier === "back";
  const isWild = identifier === "choose" || identifier === "+4";
  const Icon = ICONS[identifier];
  const color = (!isBack && props.color) || "black";
  const textClass = `${classes.text} ${
    identifier.length > 1 ? classes.long : ""
  } ${identifier === "6" || identifier === "9" ? classes.underline : ""}`;
  const corner = Icon ? <Icon /> : <span className={textClass}>{identifier}</span>;

  return (
    <div
      onClick={props.onClick}
      style={
        {
          ...props.style,
          backgroundColor: color,
          "--card-color": color,
        } as React.CSSProperties
      }
      className={`${props.className || ""} ${classes.card} ${
        isBack ? classes.back : ""
      }`}
    >
      {!isBack && (
        <>
          <div className={`${classes.corner} ${classes.top}`}>{corner}</div>
          <div className={`${classes.center} ${isWild ? classes.wild : ""}`}>
            {isWild && <ChooseIcon />}
            {identifier === "+4" && <span className={textClass}>+4</span>}
            {!isWild && corner}
          </div>
          <div className={`${classes.corner} ${classes.bottom}`}>{corner}</div>
        </>
      )}
    </div>
  );
};

export default Card;

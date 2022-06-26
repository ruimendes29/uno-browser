import React from "react";
import classes from "./Card.module.scss";
import reverseSvg from "../../../public/reverse.svg";
import chooseSvg from "../../../public/choose.svg";
import forbidSvg from "../../../public/forbid.svg";
import Image from "next/image";

const getFromIdentifier = (code: string) => {
  if (!isNaN(+code)) {
    return { special: false, source: code };
  }
  switch (code) {
    case "choose":
      return {
        special: true,
        source: (
          <Image src={chooseSvg} width={100} height={100} alt="choose icon" />
        ),
      };
    case "reverse":
      return {
        special: true,
        source: (
          <Image src={reverseSvg} width={100} height={100} alt="choose icon" />
        ),
      };
    case "forbid":
      return {
        special: true,
        source: (
          <Image src={forbidSvg} width={100} height={100} alt="choose icon" />
        ),
      };
    default:
      return { special: false, source: code };
  }
};

const Card = (props: {
  onClick?: any;
  style?: any;
  id?: string;
  className?: string;
  identifier: number | string;
  color?: string;
}) => {
  const fromIdentifier = getFromIdentifier(props.identifier + "");
  const subIdentifier =
    props.identifier === "+4" ? getFromIdentifier("choose") : fromIdentifier;
  return (
    <div
      onClick={
        props.onClick
          ? () => {
              props.onClick();
            }
          : () => {}
      }
      style={{
        ...props.style,
        backgroundColor: `${props.color ? props.color : "black"}`,
      }}
      className={`${classes[props.identifier]} ${props.className} ${classes.card}`}
    >
      <div
        className={`${subIdentifier.special ? classes.img : ""} ${
          classes.sub
        } ${classes.top}`}
      >
        {subIdentifier.source}
      </div>
      <div className={`${classes.identifier}`}>{fromIdentifier.source}</div>
      <div
        className={`${subIdentifier.special ? classes.img : ""} ${
          classes.sub
        } ${classes.bottom}`}
      >
        {subIdentifier.source}
      </div>
    </div>
  );
};

export default Card;

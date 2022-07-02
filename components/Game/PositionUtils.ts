export const angleToPosition = (angle: number) => {
  const seno = Math.sin(angle);
  const cosseno = Math.cos(angle);
  const ret: {
    top?: string;
    bottom?: string;
    right?: string;
    left?: string;
    transform?: string;
  } = { transform: "" };
  if (seno >= 0) {
    ret.transform += "translateY(-50%) ";
    const top = Math.round(50 - seno * 50) + "%";
    ret.top = Math.abs(cosseno) < 0.0001 ? `calc(${top} + 5.6em)` : top;
  } else {
    ret.transform += "translateY(50%) ";
    const bottom = Math.round(50 - -seno * 50) + "%";
    ret.bottom =
      Math.abs(cosseno) < 0.0001 ? `calc(${bottom} + 5.6em)` : bottom;
  }
  if (cosseno >= 0) {
    ret.transform += `translateX(50%)`;
    
    const right = Math.round(50 - cosseno * 50) + "%";
    ret.right = Math.abs(seno) < 0.0001 ? `calc(${right} + 5.6em)` : right;
  } else {
    ret.transform += "translateX(-50%) ";
    const left = Math.round(50 - -cosseno * 50) + "%";
    ret.left = Math.abs(seno) < 0.0001 ? `calc(${left} + 5.6em)` : left;
  }
  ret.transform +=
    "rotate(" + -((angle + Math.PI / 2) * 360) / (Math.PI * 2) + "deg)";
  return ret;
};

export const turnToRelativePos = (myIndex: number, currentTurn: number, numberOfPlayers:number) => {
  return (
    (((currentTurn - myIndex) % numberOfPlayers) + numberOfPlayers) %
    numberOfPlayers
  );
};

export const getRelativeIndex = (myIndex:number,jump:number,numberOfPlayers:number) => {
  return (
    ((( myIndex+jump) % numberOfPlayers) + numberOfPlayers) %
    numberOfPlayers
  );
}

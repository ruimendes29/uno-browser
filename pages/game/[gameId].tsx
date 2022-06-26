import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";
import { useRouter } from "next/router";
import React from "react";
import GameTable from "../../components/Game/GameTable";
import { firebaseConfig } from "../../store/config";

const GamePage = (props: { rules: any; }) => {
  return <GameTable  rules={props.rules} />;
};

export async function getStaticPaths() {
  const db = getDatabase(initializeApp(firebaseConfig));
  const roomsRef = ref(db, `rooms`);
  const roomsInfo = (await get(roomsRef)).val();
  const paths = [];
  for (const room in roomsInfo) {
    paths.push({ params: { gameId: room } });
  }
  return {
    fallback: false,
    paths,
  };
}

export async function getStaticProps(context: any) {
  const db = getDatabase(initializeApp(firebaseConfig));
  const gameRef = ref(db, `rooms/${context.params.gameId}`);
  const gameInfo = (await get(gameRef)).val();
  return {
    props: {
      rules: gameInfo.rules,
    },
    revalidate: 1,
  };
}

export default GamePage;

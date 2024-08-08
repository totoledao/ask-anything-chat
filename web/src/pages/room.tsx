import { useParams } from "react-router-dom";

export function Room() {
  const { roomID } = useParams();

  return <h1>Room {roomID}</h1>;
}

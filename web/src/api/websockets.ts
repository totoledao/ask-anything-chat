import { WSMessage } from "../types/ws-types";
import { WS } from "./constants";

export function subscribeToRoom(roomID: string) {
  const ws = new WebSocket(`${WS}/${roomID}`);
  ws.onopen = () => console.log("connected to ws");
  ws.onclose = () => console.log("closed connection to ws");

  const onmessage = (callback: (e: WSMessage) => void) =>
    (ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      callback(data);
    });

  return {
    onmessage,
    close: () => ws.close(),
  };
}

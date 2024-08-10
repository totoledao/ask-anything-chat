import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { WS } from "../api/constants";
import {
  addReactionFromMessage,
  deleteReactionFromMessage,
  getRoomMessages,
} from "../api/messages";

interface MessageProps {
  roomID: string;
  messageID: string;
  message: string;
  answered?: boolean;
  reaction_count?: number;
}

function Message({
  roomID,
  messageID,
  message,
  answered = false,
  reaction_count = 0,
}: MessageProps) {
  const [wasReacted, setWasReacted] = useState(false);

  async function handleReactToMessage() {
    try {
      if (wasReacted) {
        await deleteReactionFromMessage({
          roomID: roomID,
          messageID: messageID,
        });
      } else {
        await addReactionFromMessage({ roomID: roomID, messageID: messageID });
      }

      setWasReacted((prev) => !prev);
    } catch (err) {
      toast.error(err?.toString());
    }
  }

  function messageStyle() {
    if (answered) {
      return "text-zinc-600 pointer-events-none";
    } else return "text-zinc-100";
  }

  function reactionStyle() {
    if (wasReacted) {
      return "text-orange-400 hover:text-orange-500";
    } else return "text-zinc-400 hover:text-zinc-300";
  }

  return (
    <li className={`ml-4 leading-relaxed ${messageStyle()}`}>
      {message}
      <button
        type="button"
        className={`mt-3 flex items-center gap-2 text-sm font-medium ${reactionStyle()}`}
        onClick={handleReactToMessage}
      >
        <ArrowUp className="size-4" />
        Like question ({reaction_count})
      </button>
    </li>
  );
}

export function Messages({ roomID }: { roomID?: string }) {
  if (!roomID) {
    throw new Error("Missing roomID prop");
  }

  const { data } = useSuspenseQuery({
    queryKey: ["getRoomMessages", roomID],
    queryFn: () => getRoomMessages(roomID),
  });

  useEffect(() => {
    const ws = new WebSocket(`${WS}/${roomID}`);
    ws.onopen = () => console.log("connected to ws");
    ws.onclose = () => console.log("closed connection to ws");

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
    };

    return () => ws.close();
  }, [roomID]);

  return (
    <ol className="list-decimal list-outside px-3 space-y-8">
      {data.map((msg) => (
        <Message
          key={msg.id}
          roomID={roomID}
          messageID={msg.id}
          message={msg.message}
          answered={msg.answered}
          reaction_count={msg.reaction_count}
        />
      ))}
    </ol>
  );
}

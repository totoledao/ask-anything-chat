import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";
import {
  addReactionFromMessage,
  deleteReactionFromMessage,
  getRoomMessages,
} from "../api/messages";
import { subscribeToRoom } from "../api/websockets";
import { Message as MessageType } from "../types/message-types";
import { WSMessage } from "../types/ws-types";

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
    if (answered) return;

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
  const queryClient = useQueryClient();

  if (!roomID) {
    throw new Error("Missing roomID prop");
  }

  const { data } = useSuspenseQuery({
    queryKey: ["getRoomMessages", roomID],
    queryFn: () => getRoomMessages(roomID),
  });

  const wsEventHandler = useCallback(
    (e: WSMessage) => {
      function updater(update: (state: MessageType[]) => MessageType[]) {
        queryClient.setQueryData<MessageType[]>(
          ["getRoomMessages", roomID],
          (state) => update(state ?? [])
        );
      }

      switch (e.kind) {
        case "message_created":
          updater((state) => [
            ...state,
            {
              id: e.value.id,
              room_id: roomID,
              message: e.value.message,
              reaction_count: 0,
              answered: false,
            } as MessageType,
          ]);
          break;
        case "message_answered":
          updater((state) =>
            state.map((msg) => {
              if (msg.id === e.value.id) {
                return {
                  ...msg,
                  answered: true,
                };
              } else return msg;
            })
          );
          break;
        case "message_reaction_increased":
        case "message_reaction_decreased":
          updater((state) =>
            state.map((msg) => {
              if (msg.id === e.value.id) {
                return {
                  ...msg,
                  reaction_count: e.value.count,
                };
              } else return msg;
            })
          );
          break;
        default:
          break;
      }
    },
    [queryClient, roomID]
  );

  useEffect(() => {
    const { onmessage, close } = subscribeToRoom(roomID);
    onmessage((e) => wsEventHandler(e));

    return () => close();
  }, [roomID, wsEventHandler]);

  return (
    <ol className="list-decimal list-outside px-3 space-y-8">
      {data
        .sort((a, b) => b.reaction_count - a.reaction_count)
        .map((msg) => (
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

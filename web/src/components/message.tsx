import { ArrowUp } from "lucide-react";
import { useState } from "react";

interface MessageProps {
  message: string;
  answered?: boolean;
  reactions?: number;
}

export function Message({
  message,
  answered = false,
  reactions = 0,
}: MessageProps) {
  const [wasReacted, setWasReacted] = useState(false);

  function handleReactToMessage() {
    if (answered) return;

    setWasReacted((prev) => !prev);
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
        Like question ({reactions})
      </button>
    </li>
  );
}

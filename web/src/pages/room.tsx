import { Share2 } from "lucide-react";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import amaLogo from "../assets/ama-logo.svg";
import { Button } from "../components/button";
import { Messages } from "../components/messages";
import { SendMessageForm } from "../components/send-message-form";

export function Room() {
  const { roomID } = useParams();

  function handleShareRoom() {
    const url = window.location.href.toString();

    if (navigator.share !== undefined && navigator.canShare()) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
      toast.info(`${url} was copied to clipboard`);
    }
  }

  return (
    <div className="mx-auto max-w-[640px] flex flex-col gap-6 py-10 px-4">
      <div className="flex items-center gap-3 px-3 ">
        <img src={amaLogo} alt="Ask me anything Logo" className="h-5" />

        <span className="text-sm text-zinc-500 truncate flex-1">
          Room code: <span className="text-zinc-300">{roomID}</span>
        </span>

        <Button
          type="button"
          text="Share"
          Icon={Share2}
          variant="zinc"
          onClick={handleShareRoom}
        />
      </div>
      <div className="h-px w-full bg-zinc-900" />

      <SendMessageForm roomID={roomID} />

      <Suspense fallback={<>Loading messages...</>}>
        <Messages roomID={roomID} />
      </Suspense>
    </div>
  );
}

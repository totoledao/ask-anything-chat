import { ArrowRight, Share2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import amaLogo from "../assets/ama-logo.svg";
import { Button } from "../components/button";
import { Message } from "../components/message";

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

  function handleSendMessage(data: FormData) {
    console.log({ data, roomID });
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

      <form
        action={handleSendMessage}
        className="flex items-center gap-2 bg-zinc-900  p-2 rounded-xl border border-zinc-800 ring-orange-400 ring-offset-3 ring-offset-zinc-950 focus-within:ring-1"
      >
        <input
          className="flex-1 text-sm bg-transparent mx-2 outline-none placeholder:text-zinc-500 text-zinc-100"
          type="text"
          name="theme"
          placeholder="Ask anything"
          autoComplete="off"
        />
        <Button text="Send" Icon={ArrowRight} />
      </form>

      <ol className="list-decimal list-outside px-3 space-y-8">
        <Message
          answered
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis suscipit est. Morbi sollicitudin lacus a odio gravida lacinia. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed tortor est, rhoncus at mollis rutrum, luctus in elit. Nulla feugiat hendrerit pellentesque."
        />
        <Message message="Phasellus id massa accumsan eros ullamcorper ornare. Donec lacus augue, porttitor sit amet lectus non, fermentum ullamcorper ante." />
        <Message message="Nulla nec metus massa. Nam a urna vitae ex eleifend congue vel quis lacus. In nec mi aliquam, euismod felis id, pulvinar libero. Cras risus nulla, ullamcorper at interdum eu, mollis vel erat." />
      </ol>
    </div>
  );
}

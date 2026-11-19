"use client";

import { useState, useRef, RefObject } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { conversationModels, ModelOption } from "@/config/models";
import {
  ArrowUpIcon,
  GlobeIcon,
  LoaderCircleIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import requestGeneraton from "@/actions/conversation/fetchGenerate";
import { RequestGenerationInput } from "@/lib/validation/conversation/ConversationZodTypes";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils"; // فرض بر وجود cn (clsx + tailwind-merge)

type Chat = {
  id: string;
  turn: number;
  userMessage: string;
  responseText: string;
};

function ChatItem({ chat }: { chat: Chat }) {
  return (
    <div className="flex w-full flex-col gap-3 my-6">
      <div className="ml-auto break-words rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
        {chat.userMessage}
      </div>
      <div className="mr-auto break-words rounded-2xl px-4 py-3 text-sm">{chat.responseText}</div>
    </div>
  );
}

function ChatInput({
  formRef,
  onSubmit,
  text,
  setDraft,
  model,
  setModel,
  canSend,
  error,
  isLoading,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  text: string;
  setDraft: (draft: string) => void;
  model: ModelOption;
  setModel: (model: ModelOption) => void;
  canSend: boolean;
  error: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="p-8 pt-0">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="w-full bg-background/70 backdrop-blur-md border-t border-border/40"
      >
        <InputGroup>
          <InputGroupTextarea
            value={text}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask the agent..."
            aria-label="Message"
            className="min-h-14"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <InputGroupAddon align="block-end" className="pt-1">
            <div className="flex flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton
                      aria-label="Add context"
                      type="button"
                      size="icon-sm"
                      variant="outline"
                    >
                      <PlusIcon />
                    </InputGroupButton>
                  }
                />
                <DropdownMenuContent align="start" side="top" className="w-44">
                  <DropdownMenuItem>
                    <PaperclipIcon />
                    Add Photos & Files
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <TelescopeIcon />
                    Deep Research
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <GlobeIcon />
                    Web Search
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline">{model.label}</Button>} />
                <DropdownMenuContent>
                  {conversationModels.map((item) => (
                    <DropdownMenuItem key={item.value ?? "null"} onClick={() => setModel(item)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* دکمه ارسال با transition نرم */}
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!canSend || isLoading}
              aria-errormessage={error ?? undefined}
              className="ml-auto relative"
            >
              <div className="relative size-4">
                <ArrowUpIcon
                  className={cn(
                    "absolute inset-0 size-4 transition-all duration-200 ease-out",
                    isLoading ? "scale-50 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0",
                  )}
                />
                <LoaderCircleIcon
                  className={cn(
                    "absolute inset-0 size-4 animate-spin transition-all duration-200 ease-out",
                    isLoading ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                />
              </div>
              <span className="sr-only">{isLoading ? "Stop" : "Send"}</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}

export default function Conversation() {
  const [userText, setUserText] = useState("");
  const [model, setModel] = useState<ModelOption>(conversationModels[0]);
  const [chat, setChat] = useState<Chat[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canSend = userText.trim().length > 0;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMessage = async (message: string) => {
    if (!canSend || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: RequestGenerationInput = {
        model: model.value ?? "",
        userPrompt: message,
        files: [],
      };

      const output = await requestGeneraton(request);

      setChat((prev) => {
        const nextTurn = prev ? prev.length + 1 : 1;
        const newMessage: Chat = {
          id: crypto.randomUUID(),
          turn: nextTurn,
          userMessage: message,
          responseText: output.output_text,
        };
        return prev ? [...prev, newMessage] : [newMessage];
      });

      setUserText("");
    } catch {
      setError("An error happened during processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  // حالت اولیه
  if (chat === null) {
    return (
      <div className="relative h-screen w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleDashedIcon />
              </EmptyMedia>
              <EmptyTitle>What can we do?</EmptyTitle>
              <EmptyDescription>
                The agent can get weather status of any city you want, write that data into a
                markdown file for you. It can also search through web and show you future weather
                data.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <ChatInput
            formRef={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              await submitMessage(userText);
            }}
            text={userText}
            setDraft={setUserText}
            model={model}
            setModel={setModel}
            canSend={canSend}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // حالت چت فعال
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-6 no-scrollbar">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {chat.map((chatValue) => (
            <ChatItem key={chatValue.id} chat={chatValue} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <ChatInput
            formRef={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              await submitMessage(userText);
            }}
            text={userText}
            setDraft={setUserText}
            model={model}
            setModel={setModel}
            canSend={canSend}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

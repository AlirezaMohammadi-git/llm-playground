"use client";

import { useState, useRef, RefObject } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import {
  ArrowUpIcon,
  GlobeIcon,
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

type Chat = {
  id: string;
  turn: number;
  userMessage: string;
  responseText: string;
};

export default function Conversation() {
  const [userText, setUserText] = useState("");
  // const [model, setModel] = useState("");
  const [chat, setChat] = useState<Chat[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canSend = userText.trim().length > 0;

  const submitMessage = (message: string) => {
    if (!canSend) return;
    setChat((prev) => {
      const nextTurn = prev ? prev.length + 1 : 1;

      const newMessage: Chat = {
        id: crypto.randomUUID(),
        turn: nextTurn,
        userMessage: message,
        responseText: `کاربر گفت: ${message}`,
      };

      return prev ? [...prev, newMessage] : [newMessage];
    });

    setUserText("");
  };

  // حالت اولیه (هنوز هیچ چتی شروع نشده)
  if (chat === null) {
    return (
      <div className="relative h-screen w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Put prompt input here */}
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleDashedIcon />
              </EmptyMedia>
              <EmptyTitle>What can we do?</EmptyTitle>
              <EmptyDescription>
                The agent can get wether atatus of any city you want, write that data into a
                markdown file for you. It can also search throw web and show you feature wether
                data.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <ChatInput
            formRef={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              submitMessage(userText);
            }}
            text={userText}
            setDraft={(d) => setUserText(d)}
            canSend={canSend}
          />
        </div>
      </div>
    );
  } else
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

        {/* PromptInput شناور */}
        <div className="fixed bottom-0 left-0 right-0">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <ChatInput
              formRef={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                submitMessage(userText);
              }}
              text={userText}
              setDraft={(d) => setUserText(d)}
              canSend={canSend}
            />
          </div>
        </div>
      </div>
    );
}

function ChatItem({ chat }: { chat: Chat }) {
  return (
    <div className="flex w-full flex-col gap-3 my-6">
      {/* پیام کاربر */}
      <div className="ml-auto break-words rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
        {chat.userMessage}
      </div>

      {/* پاسخ مدل */}
      <div className="mr-auto break-words rounded-2xl px-4 py-3 text-sm">{chat.responseText}</div>
    </div>
  );
}
function ChatInput({
  formRef,
  onSubmit,
  text,
  setDraft,
  canSend,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  text: string;
  setDraft: (draft: string) => void;
  canSend: boolean;
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
                <DropdownMenuItem>
                  <TelescopeIcon />
                  Deep Research
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GlobeIcon />
                  Web Search
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!canSend}
              className="ml-auto"
            >
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}

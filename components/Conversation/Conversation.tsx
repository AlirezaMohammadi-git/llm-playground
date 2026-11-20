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
import { Markdown } from "../markdown";

type Chat = {
  id: string;
  turn: number;
  userMessage: string;
  responseText: string;
};

function ChatItem({
  chat,
  files,
  setFiles,
}: {
  chat: Chat;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [componentError, setComponentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setComponentError(null);

    if (files.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    setComponentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 my-6">
      <div>
        {/* نمایش لیست فایل‌های انتخاب‌شده */}
        {files.length > 0 && chat.turn === 1 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {files.length} / {MAX_FILES} فایل
              </span>
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                حذف همه
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="max-w-[180px] truncate" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
                    aria-label={`حذف ${file.name}`}
                  >
                    <span className="sr-only">حذف</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {componentError && <p className="mb-2 text-xs text-destructive">{componentError}</p>}
      </div>
      <div className="ml-auto break-words rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
        {chat.userMessage}
      </div>
      {/* <Markdown >{chat.responseText}<Markdown/> */}
      <Markdown className="mr-auto break-words rounded-xl px-4 py-3 text-sm" rtl>
        {chat.responseText}
      </Markdown>
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
  files,
  setFiles,
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
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [componentError, setComponentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setComponentError(null);

    if (files.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    setComponentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) return;

    setFiles((prev) => {
      const remainingSlots = MAX_FILES - prev.length;

      if (remainingSlots <= 0) {
        setComponentError(`حداکثر ${MAX_FILES} فایل مجاز است.`);
        return prev;
      }

      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      const newFiles = [...prev, ...filesToAdd];

      if (selectedFiles.length > remainingSlots) {
        setComponentError(
          `فقط ${remainingSlots} فایل اضافه شد. حداکثر ${MAX_FILES} فایل مجاز است.`,
        );
      } else {
        setComponentError(null);
      }

      return newFiles;
    });

    e.target.value = "";
  };

  return (
    <div className="relative p-8 pt-12">
      {/* گرادیان نرم از پایین (background) به بالا (transparent) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-background"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {/* نمایش لیست فایل‌های انتخاب‌شده */}
        {files.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {files.length} / {MAX_FILES} فایل
              </span>
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                حذف همه
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="max-w-[180px] truncate" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
                    aria-label={`حذف ${file.name}`}
                  >
                    <span className="sr-only">حذف</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {componentError && <p className="mb-2 text-xs text-destructive">{componentError}</p>}

        <form ref={formRef} onSubmit={onSubmit} className="w-full">
          <InputGroup className="px-1 max-h-43">
            <InputGroupTextarea
              value={text}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask the agent..."
              aria-label="Message"
              disabled={isLoading}
              className="min-h-8 w-120 max-h-42 no-scrollbar"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <InputGroupAddon align="inline-start">
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
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                      disabled={files.length >= MAX_FILES}
                    >
                      <PaperclipIcon />
                      Add Photos & Files
                      {files.length > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {files.length}/{MAX_FILES}
                        </span>
                      )}
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
            </InputGroupAddon>

            <InputGroupAddon align="inline-end">
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
    </div>
  );
}

export default function Conversation() {
  const [userText, setUserText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [model, setModel] = useState<ModelOption>(conversationModels[0]);
  const [chat, setChat] = useState<Chat[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canSend = userText.trim().length > 0 || files.length > 0;
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
        files: files,
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
            files={files}
            setFiles={setFiles}
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
            <ChatItem key={chatValue.id} chat={chatValue} files={files} setFiles={setFiles} />
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
            files={files}
            setFiles={setFiles}
          />
        </div>
      </div>
    </div>
  );
}

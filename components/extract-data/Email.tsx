"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function EmailExtraction() {
  const [rawJson, _] = useState("");
  const [RawEmail, setRawEmail] = useState("");
  return (
    <div className="w-full flex flex-col gap-2 max-w-2xl place-self-center">
      <h3>Raw Email</h3>
      <div className="w-full grid gap-2">
        <Textarea
          value={RawEmail}
          onChange={(e) => setRawEmail(e.target.value)}
          className="font-sm max-h-[256px]"
          placeholder="Write your raw email here..."
        />
        <Button variant={"default"}>Process</Button>
      </div>
      <div className="mt-6">
        <h3>Result</h3>
      </div>
      <div className="mt-6">
        <h3>Raw JSON</h3>
        <Textarea
          className="font-sm max-h-[256px]"
          readOnly
          value={rawJson}
          placeholder="Raw output json will apear here..."
        />
      </div>
    </div>
  );
}

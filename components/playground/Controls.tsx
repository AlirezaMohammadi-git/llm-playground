"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Action, State } from "@/types";
import { models } from "@/lib/utils";

export default function Controls({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="flex flex-col items-start justify-start w-full gap-4">
      <div className="flex gap-4 w-full">{Fields({ state, dispatch })}</div>
    </div>
  );
}

function Fields({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4">
                <Field>
                  <FieldLabel>Model</FieldLabel>
                  <Select
                    items={models}
                    value={state.model}
                    onValueChange={(value) => dispatch({ type: "SET_MODEL", payload: value })}
                  >
                    <SelectTrigger id="model-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {models.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>API BaseURL</FieldLabel>
                <Input
                  id="model-base-url"
                  placeholder="https://api.openai.com/v1"
                  required
                  value={state.baseUrl}
                  onChange={(e) => dispatch({ type: "SET_BASE_URL", payload: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>API Key</FieldLabel>
                <Input
                  id="model-api-key"
                  placeholder="sk-..."
                  value={state.apiKey}
                  onChange={(e) => dispatch({ type: "SET_API_KEY", payload: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="temperature-input">Temperature</FieldLabel>
                  <Input
                    id="temperature-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    inputMode="decimal"
                    placeholder="0.7"
                    value={state.temperature ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        dispatch({ type: "SET_TEMPERATURE", payload: null });
                        return;
                      }
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) {
                        dispatch({ type: "SET_TEMPERATURE", payload: parsed });
                      }
                    }}
                    onKeyDown={(e) => {
                      // جلوگیری از وارد کردن کاراکترهای غیرعددی مانند 'e', 'E', '+', '-'
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Field>

                <Field>
                  <FieldLabel>Max Tokens</FieldLabel>
                  <Input
                    id="model-max-tokens"
                    placeholder="900000"
                    step="1"
                    min="1"
                    type="number"
                    inputMode="numeric"
                    value={state.maxTokens ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        dispatch({ type: "SET_MAX_TOKENS", payload: null });
                        return;
                      }
                      const parsed = parseInt(val);
                      if (!isNaN(parsed)) {
                        dispatch({ type: "SET_MAX_TOKENS", payload: parsed });
                      }
                    }}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="model-top-p">Top P</FieldLabel>
                  <Input
                    id="model-top-p"
                    type="number"
                    step="any"
                    min="0"
                    max="1"
                    inputMode="decimal"
                    placeholder="0.73"
                    value={state.topP ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      // ۱. اجازه دادن به خالی شدن اینپوت برای تایپ راحت‌تر
                      if (val === "") {
                        dispatch({ type: "SET_TOP_P", payload: null });
                        return;
                      }

                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) {
                        // در onChange فقط مقدار تایپ شده را ذخیره می‌کنیم (بدون Clamp لحظه‌ای)
                        dispatch({ type: "SET_TOP_P", payload: parsed });
                      }
                    }}
                    onBlur={() => {
                      // ۲. اعتبارسنجی نهایی و Clamp کردن مقدار بین 0 و 1 هنگام خروج فوکوس
                      if (state.topP !== null && state.topP !== undefined) {
                        const clamped = Math.max(0, Math.min(1, state.topP));
                        dispatch({ type: "SET_TOP_P", payload: clamped });
                      }
                    }}
                    onKeyDown={(e) => {
                      // جلوگیری از تایپ کاراکترهای علمی و نشانه‌ها
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel>Top K</FieldLabel>
                  <Input
                    id="model-top-k"
                    placeholder="4"
                    step="1"
                    min="0"
                    type="number"
                    inputMode="numeric"
                    value={state.topK ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        dispatch({ type: "SET_TOP_K", payload: null });
                        return;
                      }
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed)) {
                        dispatch({ type: "SET_TOP_K", payload: parsed });
                      }
                    }}
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}

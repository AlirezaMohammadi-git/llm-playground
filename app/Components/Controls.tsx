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

export default function Controls(numberOfControls: number = 1) {
  return (
    <div className="flex flex-col items-start justify-start w-full gap-4">
      <div className="flex gap-4 w-full">{FieldDemo(numberOfControls)}</div>
    </div>
  );
}

const model_1 = [
  { label: "gpt-6-luna", value: null },
  { label: "gpt-6-luna", value: "openai/gpt-6-luna" },
  { label: "claude-opus-5.5", value: "anthropic/claude-opus-5.5" },
];

export function FieldDemo(numberOfControls: number = 1) {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4">
                <Field>
                  <FieldLabel>Model {numberOfControls}</FieldLabel>
                  <Select items={model_1}>
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {model_1.map((item) => (
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
                  id="checkout-7j9-card-name-43j"
                  placeholder="https://api.openai.com/v1"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>API Key</FieldLabel>
                <Input id="checkout-7j9-card-number-uw1" placeholder="sk-..." />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Temperature</FieldLabel>
                  <Input id="checkout-7j9-card-number-uw1" placeholder="0.7" />
                </Field>
                <Field>
                  <FieldLabel>Max Tokens</FieldLabel>
                  <Input id="checkout-7j9-card-number-uw1" placeholder="900000" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Top P</FieldLabel>
                  <Input id="checkout-7j9-card-number-uw1" placeholder="0.73" />
                </Field>
                <Field>
                  <FieldLabel>Top K</FieldLabel>
                  <Input id="checkout-7j9-card-number-uw1" placeholder="4" />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}

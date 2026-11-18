import Playground from "@/components/playground/PlaygroundForm";
import { loadDefaultState } from "@/lib/api/LoadDefaults";

export default function PlaygroundPage() {
  return <Playground defaultState={loadDefaultState()} />;
}

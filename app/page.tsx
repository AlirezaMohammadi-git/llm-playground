import Conversation from "@/components/Conversation/Conversation";
import NavigationBar from "@/components/Navigation";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col pt-12">
      <NavigationBar />
      <Conversation />
    </main>
  );
}

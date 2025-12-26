import ChatUI from "@/app/components/ChatUI";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-0 md:p-10">
      <div className="w-full h-full max-w-lg">
        <ChatUI />
      </div>
    </main>
  );
}

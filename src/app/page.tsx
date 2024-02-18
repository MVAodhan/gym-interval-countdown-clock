import Image from "next/image";
import Stopwatch from "./components/Stopwatch";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify- p-24">
      <Stopwatch />
    </main>
  );
}

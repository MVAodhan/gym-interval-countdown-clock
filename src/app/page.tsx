import Image from "next/image";
import Stopwatch from "./components/Stopwatch";
import StopwatchWithRest from "./components/StopwatchWithRest";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify- p-24">
      <StopwatchWithRest />
    </main>
  );
}

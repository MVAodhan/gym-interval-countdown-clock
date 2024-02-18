"use client";

import React, { useEffect, useState } from "react";

import { Howl } from "howler";
import { Antonio } from "next/font/google";

const inter = Antonio({ subsets: ["latin"] });

const Stopwatch = () => {
  const numberSound = new Howl({
    src: ["countdown_number.mp3"],
  });
  const goSound = new Howl({
    src: ["countdown_go.mp3"],
  });
  const [isRunning, setIsRunning] = useState(false);
  const phases = [
    { timeMS: 10000, intervalMinutes: 0 },

    { timeMS: 250000, intervalMinutes: 2 },
  ];
  const [phaseNum, setPhaseNum] = useState(0);
  const timeMS = phases[0].timeMS;
  const [time, setTime] = useState(timeMS);

  const getMinutes = (ms: number) =>
    ("0" + Math.floor((ms / 60 / 1000) % 60)).slice(-2);
  const getSeconds = (ms: number) =>
    ("0" + Math.floor((ms / 1000) % 60)).slice(-2);

  const formatTime = (ms: number) => `${getMinutes(ms)}:${getSeconds(ms)}`;

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => setTime((time) => time - 1000), 1000);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    const currentMinute = Math.floor(time / 60000);
    const totalMinutes = Math.floor(phases[phaseNum]?.timeMS / 60000);
    // if interval 2 or 5, do some stuff
    // 2 minute interval meaning 1 set every 2 minutes
    if (
      phases[phaseNum]?.intervalMinutes === 2 ||
      phases[phaseNum]?.intervalMinutes === 5
    ) {
      // if currentMinute mod interval === 0, do thing
      if (currentMinute % phases[phaseNum]?.intervalMinutes === 0) {
        if (currentMinute % totalMinutes !== 0) {
          // every 3rd, 2nd or 1st second of minute, do thing
          if (
            currentMinute * 60000 + 3000 === time ||
            currentMinute * 60000 + 2000 === time ||
            currentMinute * 60000 + 1000 === time
          ) {
            numberSound.play();
          }

          // if current minute is even, do thing on 0
          if (currentMinute * 60000 === time) {
            goSound.play();
          }
        }
      }
    }

    // if no interval
    if (phases[phaseNum]?.intervalMinutes === 0) {
      // if is 3000, 2000 or 1000, do thing
      if (time === 3000 || time === 2000 || time === 1000) {
        numberSound.play();
      }
      if (time === 0) {
        goSound.play();
      }
    }

    if (time === 0) {
      setIsRunning(false);

      setPhaseNum((prev) => prev + 1);
      console.log(phases[phaseNum + 1]);
      console.log(typeof phases[phaseNum + 1]);

      if (phases[phaseNum + 1] !== undefined) {
        setTime(phases[phaseNum + 1].timeMS);
        setIsRunning(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return (
    <div className=" w-4/5 flex flex-col">
      <div
        className={`flex justify-center text-[200px] text-[#ff1717] ${inter.className}`}
      >
        {formatTime(time)}
      </div>
      <div className="w-full flex justify-between">
        <button onClick={() => setIsRunning(true)}>Start</button>

        <button onClick={() => setIsRunning(true)}>Resume</button>

        <button onClick={() => setIsRunning(false)}>Stop</button>

        <button
          onClick={() => {
            setTime(phases[0].timeMS);
            setPhaseNum(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;

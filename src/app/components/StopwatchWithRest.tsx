"use client";

import React, { useEffect, useRef, useState } from "react";

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
    // { timeMS: 120000, sets: 1, rests: false },
    { timeMS: 600000, sets: 5, rests: true, restMs: 60000 },
    { timeMS: 600000, sets: 5, rests: false },
  ];

  const [phaseNum, setPhaseNum] = useState(0);
  const timeMS = phases[0].timeMS;
  const [time, setTime] = useState(10000);
  const [isRestPeriod, setIsRestPeriod] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [setNum, setSetNum] = useState(0);
  const [allPhases, setAllPhases] = useState([{}]);

  const timerRef = useRef<any>();

  const getMinutes = (ms: number) =>
    ("0" + Math.floor((ms / 60 / 1000) % 60)).slice(-2);
  const getSeconds = (ms: number) =>
    ("0" + Math.floor((ms / 1000) % 60)).slice(-2);

  const formatTime = (ms: number) => `${getMinutes(ms)}:${getSeconds(ms)}`;

  const calculateSetsAndRests = (phasesNum: number) => {
    let times: {}[] = [];
    let totalPhases: number = 0;
    if (phases[phasesNum].sets === 1) {
      totalPhases = 1;
    }
    if (phases[phasesNum].rests === false && phases[phasesNum].sets > 1) {
      totalPhases = phases[phasesNum].sets;
    }
    if (phases[phasesNum].rests) {
      totalPhases = phases[phasesNum].sets + (phases[phasesNum].sets - 1);
    }
    for (let i = 1; i <= totalPhases; i++) {
      let time = {};

      if (phases[phasesNum].sets === 1 && phases[phasesNum].rests === false) {
        times = [...times, { timeMS: phases[phasesNum].timeMS, rest: false }];
      }
      if (phases[phasesNum].sets > 1 && phases[phasesNum].rests === false) {
        times = [
          ...times,
          {
            timeMS: phases[phasesNum].timeMS / phases[phasesNum].sets,
            rest: false,
          },
        ];
      }
      if (phases[phasesNum].sets > 1 && phases[phasesNum].rests === true) {
        if ((i + 10) % 2 !== 0) {
          time = {
            timeMS: phases[phasesNum].timeMS / phases[phasesNum].sets,
            rest: false,
          };
        } else {
          time = {
            timeMS: phases[phasesNum].restMs,
            rest: phases[phasesNum].rests,
          };
        }
        times = [...times, time];
      }
    }

    return times;
  };

  const calculatePhases = () => {
    let finalPhases: any[] = [];
    for (let i = 0; i < phases.length; i++) {
      let setsAndRests = calculateSetsAndRests(i);
      finalPhases = [...finalPhases, { times: setsAndRests }];
    }
    return finalPhases;
  };
  useEffect(() => {
    let finalPhases = calculatePhases();

    setAllPhases(finalPhases);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(
        () => setTime((time) => time - 1000),
        1000
      );
    }

    return () => {
      clearInterval(timerRef.current);
      console.log("interval cleared");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // console.log("allPhases", allPhases);
  console.log("allPhases[0]", allPhases[0]);

  useEffect(() => {
    if (isRunning) {
      if (time === 3000 || time === 2000 || time === 1000) {
        numberSound.play();
      }
      if (time === 0) {
        goSound.play();
      }

      if (time === 0) {
        setSetNum((prev) => prev + 1);

        if (allPhases[phaseNum].times[setNum] !== undefined) {
          setTime(allPhases[phaseNum].times[setNum].timeMS);
        } else {
          setPhaseNum((prev) => prev + 1);
          setSetNum(0);
          setTime(allPhases[phaseNum].times[setNum]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return (
    <div className=" w-4/5 flex flex-col">
      <div
        className={`flex flex-col items-center text-[200px] text-[#ff1717] ${inter.className}`}
      >
        {isRestPeriod && <div className="text-2xl">REST!</div>}
        {!isRestPeriod && formatTime(time)}
        {!isRunning && isRestPeriod && formatTime(restTime)}
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

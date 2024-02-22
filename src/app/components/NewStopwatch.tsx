"use client";

import React, { useEffect, useRef, useState } from "react";

import { Howl } from "howler";
import { Antonio } from "next/font/google";

const inter = Antonio({ subsets: ["latin"] });

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";

const Stopwatch = () => {
  const numberSound = new Howl({
    src: ["countdown_number.mp3"],
  });
  const goSound = new Howl({
    src: ["countdown_go.mp3"],
  });
  const [isRunning, setIsRunning] = useState(false);
  const inputData = [
    { timeMS: 120000, sets: 1, rests: false },
    { timeMS: 240000, sets: 4, rests: true, restMs: 20000 },
  ];

  const [time, setTime] = useState(0);

  const [phaseNum, setPhaseNum] = useState(0);
  const [setNum, setSetNum] = useState(0);

  const [phases, setPhases] = useState<GymSet[][]>();

  const timerRef = useRef<any>();

  interface GymSet {
    timeMS: number;
    rest: boolean;
    sets: number;
  }

  const getMinutes = (ms: number) =>
    ("0" + Math.floor((ms / 60 / 1000) % 60)).slice(-2);
  const getSeconds = (ms: number) =>
    ("0" + Math.floor((ms / 1000) % 60)).slice(-2);

  const formatTime = (ms: number) => `${getMinutes(ms)}:${getSeconds(ms)}`;

  const calculateSets = (timeMS: number, sets: number) => {
    let phaseSets: GymSet[] = [];
    for (let i = 0; i < sets; i++) {
      phaseSets = [
        ...phaseSets,
        { timeMS: timeMS / sets, rest: false, sets: sets },
      ];
    }

    return phaseSets;
  };

  const calculateRests = (sets: number, restMS: number) => {
    let phaseRests: GymSet[] = [];
    for (let i = 0; i < sets - 1; i++) {
      phaseRests = [...phaseRests, { timeMS: restMS, rest: true, sets: sets }];
    }

    return phaseRests;
  };

  const calculatePhase = (i: number) => {
    let phase: GymSet[] = [];
    let sets = calculateSets(inputData[i].timeMS, inputData[i].sets);
    let rests: GymSet[] = [];
    if (inputData[i]) {
      rests = calculateRests(inputData[i].sets, inputData[i].restMs as number);
    }

    let total = sets.length + rests.length;
    for (let i = 0; i < total; i++) {
      if (i % 2 === 0) {
        phase = [...phase, sets.shift()!];
      } else {
        phase = [...phase, rests.shift()!];
      }
    }

    return phase;
  };

  const calculatePhases = () => {
    let phases: GymSet[][] = [];
    for (let i = 0; i < inputData.length; i++) {
      let phase = calculatePhase(i);
      phases = [...phases, phase];
    }

    setPhases(phases);
  };

  // console.log(phases);

  useEffect(() => {
    calculatePhases();
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    let currentPhase;
    if (phases) {
      currentPhase = phases[phaseNum];
    }

    if (isRunning) {
      if (time === 3000 || time === 2000 || time === 1000) {
        numberSound.play();
      }
      if (time === 0) {
        goSound.play();
      }

      if (time === 0) {
        if (currentPhase) {
          setIsRunning(false);
          console.log(currentPhase);
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
        <div className="text-2xl">SET : {setNum}</div>
        {formatTime(time)}
      </div>
      <div className="w-full flex justify-between">
        <button
          onClick={() => {
            setIsRunning(true);
            setTime(phases![0][0].timeMS);
          }}
        >
          Start
        </button>

        <button onClick={() => setIsRunning(true)}>Resume</button>

        <button onClick={() => setIsRunning(false)}>Stop</button>

        {/* <button
          onClick={() => {
            setPhaseNum(0);
          }}
        >
          Reset
        </button> */}
        <MyDrawer />
      </div>
    </div>
  );
};

const MyDrawer = () => {
  return (
    <div>
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Stopwatch;

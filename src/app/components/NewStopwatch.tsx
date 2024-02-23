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
  const inputData = [
    { timeMS: 20000, sets: 4, rests: false },
    { timeMS: 240000, sets: 4, rests: true, restMs: 20000 },
  ];
  const numberSound = new Howl({
    src: ["countdown_number.mp3"],
  });
  const goSound = new Howl({
    src: ["countdown_go.mp3"],
  });
  const [isRunning, setIsRunning] = useState(false);

  const [time, setTime] = useState(0);

  const [phaseNum, setPhaseNum] = useState(0);
  const [setNum, setSetNum] = useState(0);

  const [phases, setPhases] = useState<Phase[]>([]);

  const timerRef = useRef<any>();

  interface GymSet {
    timeMS: number;
    rest: boolean;
  }

  interface Phase {
    numSets: number;
    sets: GymSet[];
  }

  const getMinutes = (ms: number) =>
    ("0" + Math.floor((ms / 60 / 1000) % 60)).slice(-2);
  const getSeconds = (ms: number) =>
    ("0" + Math.floor((ms / 1000) % 60)).slice(-2);

  const formatTime = (ms: number) => `${getMinutes(ms)}:${getSeconds(ms)}`;

  const calculateSets = (timeMS: number, sets: number) => {
    let phaseSets: GymSet[] = [];
    for (let i = 0; i < sets; i++) {
      phaseSets = [...phaseSets, { timeMS: timeMS / sets, rest: false }];
    }

    return phaseSets;
  };

  const calculateRests = (sets: number, restMS: number, rests: boolean) => {
    let phaseRests: GymSet[] = [];
    let restLen = 0;

    if (rests !== false) {
      for (let i = 0; i < sets - 1; i++) {
        phaseRests = [...phaseRests, { timeMS: restMS, rest: true }];
        restLen = restLen + 1;
      }
    }

    return { phaseRests, restLen };
  };

  const calculatePhase = (i: number) => {
    let phaseSets: GymSet[] = [];

    let sets = calculateSets(inputData[i].timeMS, inputData[i].sets);

    let { phaseRests, restLen } = calculateRests(
      inputData[i].sets,
      inputData[i].restMs as number,
      inputData[i].rests
    );

    let total = sets.length + restLen;
    if (restLen > 0) {
      for (let i = 0; i < total; i++) {
        if (i % 2 === 0) {
          phaseSets = [...phaseSets, sets.shift()!];
        }
        if (i % 2 !== 0 && restLen !== 0) {
          phaseSets = [...phaseSets, phaseRests.shift()!];
        }
      }
    } else {
      for (let i = 0; i < total; i++) {
        phaseSets = [...phaseSets, sets.shift()!];
      }
    }

    return { phaseNum: i + 1, sets: [...phaseSets] };
  };

  const calculatePhases = () => {
    let phases: Phase[] = [];
    for (let i = 0; i < inputData.length; i++) {
      let { sets } = calculatePhase(i);
      phases = [...phases, { numSets: sets.length, sets: sets }];
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
            setPhaseNum(0);
            setTime(phases[phaseNum].sets[0].timeMS);
          }}
        >
          Start
        </button>

        <button onClick={() => setIsRunning(true)}>Resume</button>

        <button onClick={() => setIsRunning(false)}>Stop</button>

        {
          <button
            onClick={() => {
              setPhaseNum(0);
              setSetNum(0);
              setTime(0);
            }}
          >
            Reset
          </button>
        }
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

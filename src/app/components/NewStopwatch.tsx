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

interface GymSet {
  timeMS: number;
  rest: boolean;
}

const Stopwatch = () => {
  const inputData = [
    { timeMS: 10000, sets: 2, rests: true, restMS: 15000 },
    // { timeMS: 20000, sets: 2, rests: true, restMS: 5000 },
    // { timeMS: 60000, sets: 3, rests: true, restMS: 5000 },
  ];
  const numberSound = new Howl({
    src: ["countdown_number.mp3"],
  });
  const goSound = new Howl({
    src: ["countdown_go.mp3"],
  });
  const [isRunning, setIsRunning] = useState(false);

  const [time, setTime] = useState(0);
  const [phases, setPhases] = useState<any[]>([]);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [transitionMS, setTransitionMS] = useState(6000);
  const [isRest, setIsRest] = useState(false);

  const timerRef = useRef<any>();

  const setRef = useRef(0);
  const setDisplayRef = useRef(0);
  const phaseRef = useRef(0);
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

    if (rests !== false && restMS !== 0) {
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
      inputData[i].restMS,
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
    let phases: any[] = [];
    for (let i = 0; i < inputData.length; i++) {
      let { sets } = calculatePhase(i);
      phases = [...phases!, { numSets: sets.length, sets: sets }];
    }

    return phases!;
  };

  const calculateTransitions = (phases: any) => {
    let transitions: any = [];
    for (let i = 0; i < phases.length - 1; i++) {
      transitions = [
        ...transitions,
        { transition: true, timesMS: transitionMS },
      ];
    }

    return transitions;
  };

  const getCurrentPhase: any = () => {
    let current;

    if (phases.length > 0) {
      current = phases[phaseRef.current];
    }

    return { current };
  };

  useEffect(() => {
    let phases = calculatePhases();
    let transitions = calculateTransitions(phases);

    if (!phaseTransition) {
      setPhases(phases);
    } else {
      let newPhases: any = [];
      for (let i = 0; phases.length + transitions.length; i++) {
        if (i % 2 === 0) {
          newPhases = [...newPhases, phases.shift()];
        } else {
          newPhases = [...newPhases, transitions.shift()];
        }
      }
      setPhases(newPhases);
    }
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

  const handleSet = (current: { numSets: number; sets: GymSet[] }) => {
    current.sets.shift();
    if (current.sets.length === 0) {
      setIsRunning(false);
      return;
    }

    setTime(current.sets[0].timeMS);
    if (current.sets[0].rest) {
      setIsRest(true);
    } else {
      setIsRest(false);
      setDisplayRef.current = setDisplayRef.current + 1;
    }
  };

  useEffect(() => {
    if (isRunning) {
      let { current } = getCurrentPhase();
      // Handles sound
      if (time === 3000 || time === 2000 || time === 1000) {
        numberSound.play();
      }
      if (time === 0) {
        setRef.current = setRef.current + 1;
        goSound.play();
        handleSet(current);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return (
    <div className=" w-4/5 flex flex-col">
      <div
        className={`flex flex-col items-center text-[200px] text-[#ff1717] ${inter.className}`}
      >
        <div className="text-4xl">
          {" "}
          {isRunning && !isRest && `PHASE : ${phaseRef.current + 1}`}
        </div>
        <div className="text-4xl">
          {isRunning && !isRest && `SET : ${setDisplayRef.current + 1}`}
        </div>
        <div className="text-4xl">{isRest && `REST`}</div>

        {formatTime(time)}
      </div>
      <div className="w-full flex justify-between">
        <button
          onClick={() => {
            setIsRunning(true);
            setTime(phases[0].sets[0].timeMS);
          }}
        >
          Start
        </button>

        <button onClick={() => setIsRunning(true)}>Resume</button>

        <button onClick={() => setIsRunning(false)}>Stop</button>

        {
          <button
            onClick={() => {
              setTime(0);
              setRef.current = 0;
              phaseRef.current = 0;
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

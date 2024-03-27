"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

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
    { timeMS: 10000, sets: 2, rests: false, restMS: 0 },
    { timeMS: 20000, sets: 2, rests: true, restMS: 5000 },
    { timeMS: 60000, sets: 3, rests: true, restMS: 5000 },
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
  const [phaseTransition, setPhaseTransition] = useState(true);
  const [transitionMS, setTransitionMS] = useState(6000);

  const timerRef = useRef<any>();

  let phaseNumRef = useRef(0);
  let setNumRef = useRef(0);
  let displaySets = useRef(0);

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

  const addTransitions = () => {
    let newPhases: any[] = [];
    let phases = calculatePhases();

    return newPhases;
  };
  const getCurrentPhase = () => {
    let current;
    let sets;

    if (phases.length > 0) {
      current = phases[phaseNumRef.current];
      sets = current.sets;
    }

    return { current, sets };
  };

  useEffect(() => {
    let phases = calculatePhases();
    let transitions = calculateTransitions(phases);
    // console.log(transitions)

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

  console.log("phases", phases);

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
    if (isRunning) {
      let { sets } = getCurrentPhase();
      let nextSet = sets?.[setNumRef.current + 1];

      if (time === 3000 || time === 2000 || time === 1000) {
        numberSound.play();
      }
      if (time === 0 && setNumRef.current < sets?.length!) {
        goSound.play();

        setNumRef.current = setNumRef.current + 1;
        if (!nextSet?.rest) {
          displaySets.current = displaySets.current + 1;
        }

        setTime(nextSet?.timeMS ?? 0);
      }

      if (time === 0 && setNumRef.current === sets?.length) {
        setIsRunning(false);
        setTime(0);
      }
      if (time === 0 && setNumRef.current === sets?.length) {
        // Move to the next phase
        phaseNumRef.current = phaseNumRef.current + 1;
        // Reset the set number for the new phase
        setNumRef.current = 0;
        // Check if there are more phases
        if (phaseNumRef.current < phases.length) {
          // Get the first set of the new phase
          let { sets: newPhaseSets } = getCurrentPhase();
          // Set the timer to the time of the first set of the new phase
          setTime(newPhaseSets![0].timeMS ?? 0);
          setIsRunning(true);
          displaySets.current = 0;
        } else {
          // If all phases are complete, stop the timer
          setIsRunning(false);
          setTime(0);
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
        <div className="text-2xl">
          {" "}
          {isRunning && `PHASE : ${phaseNumRef.current + 1}`}
        </div>
        <div className="text-2xl">
          {isRunning && `SET : ${displaySets.current + 1}`}
        </div>

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

        {<button onClick={() => {}}>Reset</button>}
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

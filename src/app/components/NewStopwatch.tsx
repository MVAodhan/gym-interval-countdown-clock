"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

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

import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface GymSet {
  timeMS: number;
  rest: boolean;
}

type InputData = {
  timeMS: number;
  sets: number;
  rests: boolean;
  restMS: number;
}[];
const Stopwatch = () => {
  const inputData: InputData = [
    { timeMS: 12000, sets: 2, rests: true, restMS: 5000 },
    { timeMS: 14000, sets: 2, rests: true, restMS: 5000 },
    { timeMS: 24000, sets: 3, rests: true, restMS: 5000 },
  ];
  const [inputDataState, setInputDataState] = useState(inputData);
  const numberSound = new Howl({
    src: ["countdown_number.mp3"],
  });
  const goSound = new Howl({
    src: ["countdown_go.mp3"],
  });
  const [isRunning, setIsRunning] = useState(false);

  const [time, setTime] = useState(0);
  const [transitionTime, setTransitionTime] = useState(0);
  const [phases, setPhases] = useState<any[]>([]);
  const [phaseTransition, setPhaseTransition] = useState(true);
  const [transitionMS, setTransitionMS] = useState(6000);

  const [isRest, setIsRest] = useState(false);

  const [isTransitionRunning, setIsTransitionRunning] = useState(false);

  const timerRef = useRef<any>();
  const transitionTimerRef = useRef<any>();

  const [addPhases, setAddPhases] = useState<{}[]>([]);

  const setRef = useRef(0);
  const setDisplayRef = useRef(0);
  const phaseRef = useRef(0);
  const phaseDisplayRef = useRef(0);

  const handleAddPhase = () => {
    const id = nanoid();
    const addPhase = {
      id: id,
      sets: 0,
      rest: false,
      restMS: 0,
    };

    setAddPhases([...addPhases, addPhase]);

    return id;
  };

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

    let sets = calculateSets(inputDataState[i].timeMS, inputDataState[i].sets);

    let { phaseRests, restLen } = calculateRests(
      inputDataState[i].sets,
      inputDataState[i].restMS,
      inputDataState[i].rests
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

  // inputDataState edited below and above
  const calculatePhases = () => {
    let phases: any[] = [];
    for (let i = 0; i < inputDataState.length; i++) {
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
  }, [inputDataState]);

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

  const handleTransition = (current: any) => {
    setIsRunning(false);
    setTransitionTime(current.timesMS);
    setIsTransitionRunning(true);
  };

  useEffect(() => {
    if (isTransitionRunning) {
      transitionTimerRef.current = setInterval(
        () => setTransitionTime((time) => time - 1000),
        1000
      );
    }

    return () => {
      clearInterval(transitionTimerRef.current);
    };
  }, [isTransitionRunning]);

  useEffect(() => {
    if (isTransitionRunning) {
      if (
        transitionTime === 3000 ||
        transitionTime === 2000 ||
        transitionTime === 1000
      ) {
        numberSound.play();
      }
      if (transitionTime === 0) {
        goSound.play();
        setIsTransitionRunning(false);
        setIsRunning(true);
        handlePhase();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionTime]);

  const handlePhase = () => {
    let { current } = getCurrentPhase();

    if (!isTransitionRunning) {
      phaseRef.current = phaseRef.current + 1;
      phaseDisplayRef.current = phaseDisplayRef.current + 1;
    }

    if (phaseRef.current > phases.length) {
      setIsRunning(false);
      return;
    }

    if (current.transition && !isTransitionRunning) {
      handleTransition(current);
      return;
    }
    setRef.current = 0;
    setDisplayRef.current = 0;
    if (current) {
      handleSet(current);
    } else {
      console.log("all phases complete");
      setIsRunning(false);
    }
  };

  const handleSet = (current: { numSets: number; sets: GymSet[] }) => {
    if (current.sets.length === setRef.current) {
      phaseRef.current = phaseRef.current + 1;
      handlePhase();
      return;
    }
    setTime(current.sets[setRef.current].timeMS);
    if (current.sets[setRef.current].rest) {
      setIsRest(true);
      return;
    } else {
      setIsRest(false);
    }
    if (current.sets.indexOf(current.sets[setRef.current]) !== 0) {
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
        goSound.play();
        setRef.current = setRef.current + 1;
        handleSet(current);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  console.log("inputDataState", inputDataState);
  console.log("phases", phases);

  return (
    <div className=" w-4/5 flex flex-col">
      <div
        className={`flex flex-col items-center text-[200px] text-[#ff1717] ${inter.className}`}
      >
        <div className="text-4xl">
          {" "}
          {isRunning && !isRest && `PHASE : ${phaseDisplayRef.current + 1}`}
        </div>
        <div className="text-4xl">
          {isRunning && !isRest && `SET : ${setDisplayRef.current + 1}`}
        </div>
        <div className="text-4xl">{isRest && `REST`}</div>
        <div className="text-4xl">{isTransitionRunning && `Transition`}</div>

        <div className="flex flex-col gap-1">
          {!isTransitionRunning && <div>{<div>{formatTime(time)}</div>}</div>}
          {isTransitionRunning && <div>{formatTime(transitionTime)}</div>}
        </div>
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
        <MyDrawer
          handleAddPhases={handleAddPhase}
          addPhases={addPhases}
          setInputDataState={setInputDataState}
        />
      </div>
    </div>
  );
};

const MyDrawer = ({
  handleAddPhases,
  addPhases,
  setInputDataState,
}: {
  handleAddPhases: () => string;
  addPhases: any;
  setInputDataState: any;
}) => {
  const handleSubmit = (formData: any) => {
    let phaseIds: string[] = [];
    for (let phase of addPhases) {
      phaseIds = [...phaseIds, phase.id];
    }

    let newInputData: any[] = [];
    for (let id of phaseIds) {
      const set = formData.get(`set-${id}`);
      const setTime = formData.get(`set-time-${id}`);
      const rest = formData.get(`rest-${id}`);
      const restTime = formData.get(`rest-time-${id}`);

      let timeMS = Number(set) * Number(setTime);

      let phase = {
        timeMS: timeMS,
        sets: Number(set),
        rest: rest ? true : false,
        restMS: rest ? Number(restTime) : Number(0),
      };

      newInputData = [...newInputData, phase];
    }

    setInputDataState(newInputData);
  };

  return (
    <div>
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="flex justify-center">
            <DrawerTitle>Set Phases, Sets and Rests </DrawerTitle>
          </DrawerHeader>
          <div className="w-full flex flex-col items-center">
            <div className="flex w-full justify-end pr-2">
              <Button
                onClick={() => {
                  const id = handleAddPhases();
                }}
              >
                Add Phase
              </Button>
            </div>
            <form className="flex flex-col gap-2 my-2" action={handleSubmit}>
              {addPhases.map((phase: any) => (
                <PhaseInput key={phase.id} id={phase.id} />
              ))}
              <Button>Confirm</Button>
            </form>
          </div>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const PhaseInput = ({ id }: { id: string }) => {
  return (
    <div className="flex  gap-2 ">
      <div className="flex items-center gap-2">
        <div className="flex  items-center">
          <label className="">Set</label>
        </div>
        <Input
          className="focus-visible:ring-0"
          type="number"
          name={`set-${id}`}
        />
      </div>
      <div className="flex">
        <div className="flex w-[100px] items-center">
          <label className="">Set time</label>
        </div>
        <Input
          className="focus-visible:ring-0"
          type="number"
          name={`set-time-${id}`}
        />
      </div>
      <div className="flex items-center gap-2 ">
        <div className="flex  items-center">Rest</div>
        <Checkbox name={`rest-${id}`} />
      </div>
      <div className="flex">
        <div className="flex w-[100px] items-center">
          <label className="">Rest time</label>
        </div>
        <Input
          className="focus-visible:ring-0"
          type="number"
          name={`rest-time-${id}`}
        />
      </div>
    </div>
  );
};

export default Stopwatch;

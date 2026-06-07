import type { FighterId, StageId } from "../types";

export interface StoryLine {
  speaker: string;
  text: string;
}

export interface StoryTrial {
  id: string;
  title: string;
  stage: StageId;
  playerFighter: FighterId;
  opponentFighter: FighterId;
  introLines: StoryLine[];
  winLines: StoryLine[];
}

export const STORY_TRIALS: StoryTrial[] = [
  {
    id: "wisdom",
    title: "Trial 1: Thunder vs Wisdom",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "athena",
    introLines: [
      {
        speaker: "Zeus",
        text: "The gates of Olympus open. Let every champion prove their legend."
      },
      {
        speaker: "Athena",
        text: "Power without wisdom falls quickly. Face me, and learn the shape of victory."
      },
      {
        speaker: "Zeus",
        text: "Trial one begins: thunder against the shield."
      }
    ],
    winLines: [
      {
        speaker: "Athena",
        text: "A clean strike. You have earned the next trial."
      },
      {
        speaker: "Zeus",
        text: "The crowd of Olympus stirs. More gods will answer this challenge."
      }
    ]
  },
  {
    id: "tide",
    title: "Trial 2: Break The Tide",
    stage: "poseidon",
    playerFighter: "zeus",
    opponentFighter: "poseidon",
    introLines: [
      {
        speaker: "Poseidon",
        text: "Olympus is dry marble and ceremony. Come below the waves and learn pressure."
      },
      {
        speaker: "Zeus",
        text: "Then rise, brother. Let the arena decide whose storm commands the sea."
      }
    ],
    winLines: [
      {
        speaker: "Poseidon",
        text: "The tide breaks, but it remembers. You move forward with my respect."
      },
      {
        speaker: "Athena",
        text: "Good. You adapted instead of forcing the same answer twice."
      }
    ]
  },
  {
    id: "underworld",
    title: "Trial 3: Shadow Interruption",
    stage: "underworld",
    playerFighter: "zeus",
    opponentFighter: "hades",
    introLines: [
      {
        speaker: "Hades",
        text: "A tournament on Olympus, and no invitation for the one realm everyone eventually visits?"
      },
      {
        speaker: "Zeus",
        text: "This is not your hour, Hades."
      },
      {
        speaker: "Hades",
        text: "That is why I am taking it."
      }
    ],
    winLines: [
      {
        speaker: "Hades",
        text: "So the trial survives its first shadow. Interesting."
      },
      {
        speaker: "Zeus",
        text: "The games continue, but the Underworld has made its warning."
      }
    ]
  },
  {
    id: "war",
    title: "Trial 4: War Answers",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "ares",
    introLines: [
      {
        speaker: "Ares",
        text: "Enough riddles, waves, and royal speeches. I want a fight that leaves marks."
      },
      {
        speaker: "Zeus",
        text: "Then bring war to the summit and see if it can stand."
      }
    ],
    winLines: [
      {
        speaker: "Ares",
        text: "Ha. That one had teeth."
      },
      {
        speaker: "Athena",
        text: "The first ladder is complete. Now the greater tournament can begin."
      }
    ]
  }
];

export const STORY_COMPLETE_LINES: StoryLine[] = [
  {
    speaker: "Zeus",
    text: "The first divine ladder closes. Olympus has seen enough to demand a larger tournament."
  },
  {
    speaker: "Hades",
    text: "And below Olympus, darker brackets are already forming."
  },
  {
    speaker: "Athena",
    text: "Four trials are enough for an opening challenge. The next gates will not be so merciful."
  }
];

export function getStoryTrial(index: number): StoryTrial | undefined {
  return STORY_TRIALS[index];
}

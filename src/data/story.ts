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
    title: "Trial 1: Shield Counsel",
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
        text: "Four trials in, and the crowd finally believes this tournament has teeth."
      }
    ]
  },
  {
    id: "moon-hunt",
    title: "Trial 5: Moonlit Hunt",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "artemis",
    introLines: [
      {
        speaker: "Artemis",
        text: "The loudest champion is easiest to track. Let us see how thunder moves when the moon is watching."
      },
      {
        speaker: "Zeus",
        text: "Then draw your bow, Huntress. I will answer before the arrow lands."
      }
    ],
    winLines: [
      {
        speaker: "Artemis",
        text: "You did not chase the shadow. Good. A slower fighter would already be out of the ring."
      },
      {
        speaker: "Ares",
        text: "Now the trials are warming up."
      }
    ]
  },
  {
    id: "labors",
    title: "Trial 6: Twelve-Labor Titan",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "heracles",
    introLines: [
      {
        speaker: "Heracles",
        text: "I have carried impossible weight before. I wonder how heavy your storm feels up close."
      },
      {
        speaker: "Zeus",
        text: "Stand firm, Heracles. Olympus will remember the sound."
      }
    ],
    winLines: [
      {
        speaker: "Heracles",
        text: "That hit would have moved a mountain."
      },
      {
        speaker: "Zeus",
        text: "And still you smiled through it. The mortal legends are not exaggerated."
      }
    ]
  },
  {
    id: "bright-spear",
    title: "Trial 7: Bright Spear",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "achilles",
    introLines: [
      {
        speaker: "Achilles",
        text: "Strength is useful. Timing is fatal."
      },
      {
        speaker: "Zeus",
        text: "Then let speed test thunder."
      },
      {
        speaker: "Achilles",
        text: "Try not to blink."
      }
    ],
    winLines: [
      {
        speaker: "Achilles",
        text: "A clean read. Most warriors only learn that after they fall."
      },
      {
        speaker: "Athena",
        text: "The champion is learning patience between strikes."
      }
    ]
  },
  {
    id: "clever-voyager",
    title: "Trial 8: Clever Voyager",
    stage: "poseidon",
    playerFighter: "zeus",
    opponentFighter: "odysseus",
    introLines: [
      {
        speaker: "Odysseus",
        text: "A king of gods, a ring, and a crowd. Too many obvious paths. I prefer the crooked one."
      },
      {
        speaker: "Poseidon",
        text: "Do not trust his footing. He wins before the blade is visible."
      },
      {
        speaker: "Zeus",
        text: "Then I will strike the trick itself."
      }
    ],
    winLines: [
      {
        speaker: "Odysseus",
        text: "Well done. You found the feint and punished the hand behind it."
      },
      {
        speaker: "Hades",
        text: "Cleverness is charming. Survival is better."
      }
    ]
  },
  {
    id: "silver-ambush",
    title: "Trial 9: Silver Ambush",
    stage: "underworld",
    playerFighter: "zeus",
    opponentFighter: "artemis",
    introLines: [
      {
        speaker: "Artemis",
        text: "The Underworld changes the hunt. No clean horizon. No honest moon."
      },
      {
        speaker: "Hades",
        text: "Consider it atmosphere."
      },
      {
        speaker: "Zeus",
        text: "This arena was not approved."
      }
    ],
    winLines: [
      {
        speaker: "Artemis",
        text: "The shadows fought for the wrong side."
      },
      {
        speaker: "Hades",
        text: "They were only measuring you."
      }
    ]
  },
  {
    id: "council-fracture",
    title: "Trial 10: Council Fracture",
    stage: "olympus",
    playerFighter: "zeus",
    opponentFighter: "athena",
    introLines: [
      {
        speaker: "Athena",
        text: "The rules are bending. If this tournament continues, it needs discipline again."
      },
      {
        speaker: "Zeus",
        text: "You think I have lost control."
      },
      {
        speaker: "Athena",
        text: "I think control is proven under pressure."
      }
    ],
    winLines: [
      {
        speaker: "Athena",
        text: "The summit still stands. Barely."
      },
      {
        speaker: "Zeus",
        text: "Then we finish this before the lower gates break open."
      }
    ]
  },
  {
    id: "storm-surge",
    title: "Trial 11: Storm Surge",
    stage: "poseidon",
    playerFighter: "zeus",
    opponentFighter: "poseidon",
    introLines: [
      {
        speaker: "Poseidon",
        text: "The sea has been patient. It is finished being polite."
      },
      {
        speaker: "Zeus",
        text: "Brother, if Hades is pulling at the tournament, help me seal it."
      },
      {
        speaker: "Poseidon",
        text: "Beat the tide first. Then ask it for aid."
      }
    ],
    winLines: [
      {
        speaker: "Poseidon",
        text: "Fine. The sea stands with Olympus for one final gate."
      },
      {
        speaker: "Hades",
        text: "How noble. How breakable."
      }
    ]
  },
  {
    id: "ashen-gate",
    title: "Trial 12: The Ashen Gate",
    stage: "underworld",
    playerFighter: "zeus",
    opponentFighter: "hades",
    introLines: [
      {
        speaker: "Hades",
        text: "A tournament is just a prettier word for judgment. Welcome to mine."
      },
      {
        speaker: "Zeus",
        text: "You wanted Olympus to look below. You have its full attention."
      },
      {
        speaker: "Hades",
        text: "Then let every throne hear the gate close."
      }
    ],
    winLines: [
      {
        speaker: "Hades",
        text: "So the crown survives the first descent."
      },
      {
        speaker: "Zeus",
        text: "And the tournament becomes more than spectacle. It becomes a vow."
      }
    ]
  }
];

export const STORY_COMPLETE_LINES: StoryLine[] = [
  {
    speaker: "Zeus",
    text: "The divine ladder closes, but the arena is no longer just a game."
  },
  {
    speaker: "Hades",
    text: "A vow, a crown, a sealed gate. Dramatic words for a door that can be opened again."
  },
  {
    speaker: "Athena",
    text: "Then we prepare the next bracket before the next war chooses us."
  },
  {
    speaker: "Zeus",
    text: "Let every god and hero train. Olympus Brawler has only begun."
  }
];

export function getStoryTrial(index: number): StoryTrial | undefined {
  return STORY_TRIALS[index];
}

export function resolveStoryPlayerFighter(trial: StoryTrial, selectedPlayer?: FighterId): FighterId {
  return selectedPlayer ?? trial.playerFighter;
}

export function resolveStoryOpponentFighter(trial: StoryTrial, playerFighter: FighterId): FighterId {
  return trial.opponentFighter === playerFighter ? trial.playerFighter : trial.opponentFighter;
}

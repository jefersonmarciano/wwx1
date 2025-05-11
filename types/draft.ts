export type DraftPhase = "preban" | "pick" | "complete"

export type DraftTeam = {
  id: string
  name: string
  characters: string[]
  bans: string[]
}

export type DraftState = {
  id: string
  phase: DraftPhase
  turn: "player1" | "player2"
  player1: DraftTeam
  player2: DraftTeam
  prebans: string[]
  picks: {
    player1: string[]
    player2: string[]
  }
  currentPick: number
  maxPicks: number
  maxBans: number
  completed: boolean
  winner: string | null
}

export type DraftSettings = {
  maxPicks: number
  maxBans: number
  maxPreBans: number
  pointLimit: number
  characterCosts: {
    [key: string]: number
  }
  weaponCosts: {
    [key: string]: number
  }
  constellationMultipliers: {
    [key: number]: number
  }
  refinementMultipliers: {
    [key: number]: number
  }
}

export type TournamentRules = {
  minRosterSize: number
  minAccountCost: number
  maxWeaponPoints: number
  restartPenalties: {
    [key: number]: number
  }
  timeLimit: number
  additionalTimeLimit: number
}

export interface DraftPoints {
  characterPoints: number
  constellationPoints: number
  weaponPoints: number
  refinementPoints: number
  totalPoints: number
}

// Definição da interface para as regras do draft
export interface DraftRules {
  maxPoints: number
  characterValues: {
    rarity4: number
    rarity5: number
  }
  constellationValues: {
    value: number
    multiplier: boolean
  }
  refinementValues: {
    value: number
    multiplier: boolean
  }
  weaponValues: {
    rarity4: number
    rarity5: number
  }
}

// Regras padrão para o draft
export const DEFAULT_DRAFT_RULES: DraftRules = {
  maxPoints: 1000,
  characterValues: {
    rarity4: 100,
    rarity5: 200,
  },
  constellationValues: {
    value: 50,
    multiplier: true,
  },
  refinementValues: {
    value: 25,
    multiplier: true,
  },
  weaponValues: {
    rarity4: 50,
    rarity5: 100,
  },
}

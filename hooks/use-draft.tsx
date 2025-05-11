"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { DraftState, DraftSettings, TournamentRules } from "@/types/draft"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useTeams } from "@/hooks/use-teams"

// Default draft settings
const defaultSettings: DraftSettings = {
  maxPicks: 6,
  maxBans: 3,
  maxPreBans: 3,
  pointLimit: 30,
  characterCosts: {},
  weaponCosts: {},
  constellationMultipliers: {
    1: 1.1,
    2: 1.2,
    3: 1.3,
    4: 1.4,
    5: 1.5,
    6: 1.6,
  },
  refinementMultipliers: {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.4,
  },
}

// Tournament rules
const tournamentRules: TournamentRules = {
  minRosterSize: 15,
  minAccountCost: 250,
  maxWeaponPoints: 30,
  restartPenalties: {
    1: 0,
    2: 0,
    3: 5,
    4: 10,
    5: 300,
  },
  timeLimit: 60,
  additionalTimeLimit: 180,
}

// Initial draft state
const initialDraftState: DraftState = {
  id: "",
  phase: "preban",
  turn: "player1",
  player1: {
    id: "player1",
    name: "Player 1",
    characters: [],
    bans: [],
  },
  player2: {
    id: "player2",
    name: "Player 2",
    characters: [],
    bans: [],
  },
  prebans: [],
  picks: {
    player1: [],
    player2: [],
  },
  currentPick: 1,
  maxPicks: 6,
  maxBans: 3,
  completed: false,
  winner: null,
}

// Pick order for the draft
const pickOrder = [
  "player1",
  "player2",
  "player2",
  "player1",
  "player1",
  "player2",
  "player2",
  "player1",
  "player1",
  "player2",
  "player2",
  "player1",
]

export const useDraft = () => {
  const router = useRouter()
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { teams } = useTeams()

  const [draftState, setDraftState] = useState<DraftState>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draftState")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved draft state", e)
        }
      }
    }
    return { ...initialDraftState, id: Date.now().toString() }
  })

  const [settings, setSettings] = useState<DraftSettings>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draftSettings")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved draft settings", e)
        }
      }
    }

    // Initialize character costs
    const characterCosts: { [key: string]: number } = {}
    characters.forEach((char) => {
      characterCosts[char.id] = char.rarity === 5 ? 10 : 5
    })

    // Initialize weapon costs
    const weaponCosts: { [key: string]: number } = {}
    weapons.forEach((weapon) => {
      weaponCosts[weapon.id] = weapon.rarity === 5 ? 4 : 2
    })

    return {
      ...defaultSettings,
      characterCosts,
      weaponCosts,
    }
  })

  // Save draft state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("draftState", JSON.stringify(draftState))
    }
  }, [draftState])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("draftSettings", JSON.stringify(settings))
    }
  }, [settings])

  // Create a new draft
  const createDraft = useCallback(
    (player1Name: string, player2Name: string) => {
      const newDraft: DraftState = {
        ...initialDraftState,
        id: Date.now().toString(),
        player1: {
          ...initialDraftState.player1,
          name: player1Name,
        },
        player2: {
          ...initialDraftState.player2,
          name: player2Name,
        },
        maxPicks: settings.maxPicks,
        maxBans: settings.maxBans,
      }

      setDraftState(newDraft)
      return newDraft.id
    },
    [settings],
  )

  // Reset the draft
  const resetDraft = useCallback(() => {
    setDraftState({
      ...initialDraftState,
      id: Date.now().toString(),
      maxPicks: settings.maxPicks,
      maxBans: settings.maxBans,
    })
  }, [settings])

  // Ban a character
  const banCharacter = useCallback(
    (characterId: string) => {
      setDraftState((prev) => {
        // If we're in the preban phase
        if (prev.phase === "preban") {
          const newPrebans = [...prev.prebans]

          // Add the character to prebans if it's not already banned
          if (characterId && !newPrebans.includes(characterId)) {
            newPrebans.push(characterId)
          }

          // Check if we've reached the max prebans
          const nextPhase = newPrebans.length >= settings.maxPreBans ? "pick" : "preban"

          return {
            ...prev,
            prebans: newPrebans,
            phase: nextPhase,
            turn: nextPhase === "pick" ? "player1" : prev.turn === "player1" ? "player2" : "player1",
          }
        }

        // If we're in the pick phase (banning during picks)
        if (prev.phase === "pick") {
          const currentPlayer = prev.turn
          const opponent = currentPlayer === "player1" ? "player2" : "player1"

          // Add the character to the current player's bans
          const newBans = [...prev[currentPlayer].bans]
          if (characterId && !newBans.includes(characterId)) {
            newBans.push(characterId)
          }

          // Update the player's bans
          const updatedPlayer = {
            ...prev[currentPlayer],
            bans: newBans,
          }

          // Check if we need to move to the next turn
          const nextTurn = prev[currentPlayer].bans.length >= prev.maxBans ? opponent : currentPlayer

          return {
            ...prev,
            [currentPlayer]: updatedPlayer,
            turn: nextTurn,
          }
        }

        return prev
      })
    },
    [settings],
  )

  // Select a character
  const selectCharacter = useCallback((characterId: string) => {
    setDraftState((prev) => {
      if (prev.phase !== "pick" || !characterId) return prev

      const currentPlayer = prev.turn
      const currentPickIndex = prev.currentPick - 1

      // Check if the character is already picked or banned
      const isAlreadyPicked = prev.picks.player1.includes(characterId) || prev.picks.player2.includes(characterId)

      const isAlreadyBanned =
        prev.prebans.includes(characterId) ||
        prev.player1.bans.includes(characterId) ||
        prev.player2.bans.includes(characterId)

      if (isAlreadyPicked || isAlreadyBanned) return prev

      // Add the character to the current player's picks
      const newPicks = {
        ...prev.picks,
        [currentPlayer]: [...prev.picks[currentPlayer], characterId],
      }

      // Determine the next pick and turn
      const nextPick = prev.currentPick + 1
      let nextTurn = currentPlayer

      // If we've reached the max picks for both players, complete the draft
      const totalPicks = newPicks.player1.length + newPicks.player2.length
      const isCompleted = totalPicks >= prev.maxPicks * 2

      if (!isCompleted) {
        // Determine the next turn based on the pick order
        nextTurn =
          pickOrder[currentPickIndex] === pickOrder[nextPick - 1]
            ? currentPlayer
            : currentPlayer === "player1"
              ? "player2"
              : "player1"
      }

      return {
        ...prev,
        picks: newPicks,
        currentPick: nextPick,
        turn: nextTurn,
        phase: isCompleted ? "complete" : "pick",
        completed: isCompleted,
      }
    })
  }, [])

  // Skip the current turn
  const skipTurn = useCallback(() => {
    setDraftState((prev) => {
      if (prev.phase !== "pick") return prev

      const currentPlayer = prev.turn
      const opponent = currentPlayer === "player1" ? "player2" : "player1"

      return {
        ...prev,
        turn: opponent,
        currentPick: prev.currentPick + 1,
      }
    })
  }, [])

  // Set the winner of the draft
  const setWinner = useCallback((playerId: string) => {
    setDraftState((prev) => ({
      ...prev,
      winner: playerId,
      completed: true,
      phase: "complete",
    }))
  }, [])

  // Check if a character is banned
  const isCharacterBanned = useCallback(
    (characterId: string) => {
      return (
        draftState.prebans.includes(characterId) ||
        draftState.player1.bans.includes(characterId) ||
        draftState.player2.bans.includes(characterId)
      )
    },
    [draftState],
  )

  // Check if a character is picked
  const isCharacterPicked = useCallback(
    (characterId: string) => {
      return draftState.picks.player1.includes(characterId) || draftState.picks.player2.includes(characterId)
    },
    [draftState],
  )

  // Check if it's the current user's turn
  const isMyTurn = useCallback(() => {
    // In a real app, you would check if the current user is player1 or player2
    // For now, we'll assume the current user is always player1
    return draftState.turn === "player1"
  }, [draftState.turn])

  // Get the current player's name
  const getCurrentPlayerName = useCallback(() => {
    return draftState[draftState.turn].name
  }, [draftState])

  // Get the opponent's name
  const getOpponentName = useCallback(() => {
    const opponent = draftState.turn === "player1" ? "player2" : "player1"
    return draftState[opponent].name
  }, [draftState])

  // Get the current player's team
  const getCurrentPlayerTeam = useCallback(() => {
    return draftState[draftState.turn]
  }, [draftState])

  // Get the opponent's team
  const getOpponentTeam = useCallback(() => {
    const opponent = draftState.turn === "player1" ? "player2" : "player1"
    return draftState[opponent]
  }, [draftState])

  // Get the pick order
  const getPickOrder = useCallback(() => {
    return pickOrder
  }, [])

  // Get the pick number for a character
  const getPickNumberForCharacter = useCallback(
    (characterId: string) => {
      for (let i = 0; i < draftState.picks.player1.length; i++) {
        if (draftState.picks.player1[i] === characterId) {
          // Calculate the pick number based on the order
          return i * 2 + 1 // 1, 3, 5, ...
        }
      }

      for (let i = 0; i < draftState.picks.player2.length; i++) {
        if (draftState.picks.player2[i] === characterId) {
          // Calculate the pick number based on the order
          return i * 2 + 2 // 2, 4, 6, ...
        }
      }

      return null
    },
    [draftState.picks],
  )

  // Get the CSS class for a pick number
  const getPickColorClass = useCallback((pickNumber: number) => {
    // First player picks are red, second player picks are blue
    return pickNumber % 2 === 1 ? "bg-red-500 text-white" : "bg-blue-500 text-white"
  }, [])

  // Update draft settings
  const updateSettings = useCallback((newSettings: Partial<DraftSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }, [])

  return {
    draftState,
    settings,
    tournamentRules,
    createDraft,
    resetDraft,
    banCharacter,
    selectCharacter,
    skipTurn,
    setWinner,
    isCharacterBanned,
    isCharacterPicked,
    isMyTurn,
    getCurrentPlayerName,
    getOpponentName,
    getCurrentPlayerTeam,
    getOpponentTeam,
    getPickOrder,
    getPickNumberForCharacter,
    getPickColorClass,
    updateSettings,
  }
}

"use client"

import { useState, useEffect } from "react"
import type { Character } from "@/types/character"

interface DraftState {
  prebans: (Character | null)[]
  team1Picks: (Character | null)[]
  team2Picks: (Character | null)[]
  currentTurn: "player1" | "player2"
  phase: "preban" | "pick" | "complete"
}

export function useDraft(roomId: string) {
  // Alterando para apenas 3 personagens por time
  const [draftState, setDraftState] = useState<DraftState>({
    prebans: Array(4).fill(null),
    team1Picks: Array(3).fill(null), // Reduzido para 3 personagens
    team2Picks: Array(3).fill(null), // Reduzido para 3 personagens
    currentTurn: "player1",
    phase: "preban",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDraftState = async () => {
      try {
        // Simulando uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Inicializar o estado do draft
        setDraftState({
          prebans: Array(4).fill(null),
          team1Picks: Array(3).fill(null), // Reduzido para 3 personagens
          team2Picks: Array(3).fill(null), // Reduzido para 3 personagens
          currentTurn: "player1",
          phase: "pick", // Alterado para "pick" para corresponder à imagem de referência
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDraftState()
  }, [roomId])

  const selectCharacter = (character: Character) => {
    setDraftState((prev) => {
      // Clone do estado atual
      const newState = { ...prev }

      // Lógica para fase de preban
      if (prev.phase === "preban") {
        const prebanIndex = prev.prebans.findIndex((ban) => ban === null)
        if (prebanIndex !== -1) {
          const newPrebans = [...prev.prebans]
          newPrebans[prebanIndex] = character

          // Verificar se todos os prebans foram selecionados
          const allPrebansFilled = newPrebans.every((ban) => ban !== null)

          return {
            ...prev,
            prebans: newPrebans,
            phase: allPrebansFilled ? "pick" : "preban",
            currentTurn: allPrebansFilled ? "player1" : prebanIndex % 2 === 0 ? "player2" : "player1",
          }
        }
      }

      // Lógica para fase de pick
      if (prev.phase === "pick") {
        if (prev.currentTurn === "player1") {
          const pickIndex = prev.team1Picks.findIndex((pick) => pick === null)
          if (pickIndex !== -1) {
            const newTeam1Picks = [...prev.team1Picks]
            newTeam1Picks[pickIndex] = character

            // Verificar se todos os picks foram selecionados
            const allTeam1Filled = newTeam1Picks.every((pick) => pick !== null)
            const allTeam2Filled = prev.team2Picks.every((pick) => pick !== null)

            return {
              ...prev,
              team1Picks: newTeam1Picks,
              phase: allTeam1Filled && allTeam2Filled ? "complete" : "pick",
              currentTurn: "player2",
            }
          }
        } else {
          const pickIndex = prev.team2Picks.findIndex((pick) => pick === null)
          if (pickIndex !== -1) {
            const newTeam2Picks = [...prev.team2Picks]
            newTeam2Picks[pickIndex] = character

            // Verificar se todos os picks foram selecionados
            const allTeam1Filled = prev.team1Picks.every((pick) => pick !== null)
            const allTeam2Filled = newTeam2Picks.every((pick) => pick !== null)

            return {
              ...prev,
              team2Picks: newTeam2Picks,
              phase: allTeam1Filled && allTeam2Filled ? "complete" : "pick",
              currentTurn: "player1",
            }
          }
        }
      }

      return prev
    })
  }

  const banCharacter = (character: Character) => {
    // Implementar lógica de ban
    console.log("Banindo personagem:", character.name)
  }

  const skipTurn = () => {
    setDraftState((prev) => ({
      ...prev,
      currentTurn: prev.currentTurn === "player1" ? "player2" : "player1",
    }))
  }

  // Determinar se é a vez do jogador atual (simplificado para demonstração)
  const isPlayerTurn = draftState.currentTurn === "player1"

  // Determinar a fase atual para exibição
  const currentPhase =
    draftState.phase === "preban" ? "Ban Phase" : draftState.phase === "pick" ? "Pick Phase" : "Complete"

  return {
    draftState,
    selectCharacter,
    banCharacter,
    skipTurn,
    isPlayerTurn,
    currentPhase,
    isLoading,
    error,
  }
}

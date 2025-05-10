"use client"

import { useState, useEffect } from "react"
import type { Character } from "@/types/character"
import { useCharacters } from "./use-characters"

export interface Team {
  id: string
  name: string
  characters: Character[]
  totalCost: number
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { characters } = useCharacters()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Simulando uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Dados fictícios para demonstração
        if (characters.length > 0) {
          const mockTeams: Team[] = [
            {
              id: "1",
              name: "Time Principal",
              characters: [characters[0], characters[1], characters[2]],
              totalCost: 1250,
            },
            {
              id: "2",
              name: "Time Secundário",
              characters: [characters[6], characters[7], characters[8]],
              totalCost: 980,
            },
            {
              id: "3",
              name: "Time de Torneio",
              characters: [characters[10], characters[11], characters[12]],
              totalCost: 1500,
            },
          ]
          setTeams(mockTeams)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    if (characters.length > 0) {
      fetchTeams()
    }
  }, [characters])

  return { teams, isLoading, error }
}

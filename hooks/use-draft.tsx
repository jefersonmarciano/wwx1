"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { DraftState, DraftSettings, DraftPhase } from "@/types/draft"

type DraftContextType = {
  draft: DraftState | null
  settings: DraftSettings
  createDraft: (player1Name: string, player2Name: string) => string
  updateDraft: (updatedDraft: Partial<DraftState>) => void
  updateSettings: (updatedSettings: Partial<DraftSettings>) => void
  resetDraft: () => void
  calculatePoints: (characterId: string) => number
}

const defaultSettings: DraftSettings = {
  maxPicks: 6,
  maxBans: 3,
  maxPreBans: 3,
  pointLimit: 1500,
  characterCosts: {},
  weaponCosts: {},
  constellationMultipliers: {
    0: 1.0,
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

// Contexto para o draft
const DraftContext = createContext<DraftContextType | undefined>(undefined)

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [settings, setSettings] = useState<DraftSettings>(defaultSettings)

  // Carregar draft do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("currentDraft")
      if (savedDraft) {
        try {
          setDraft(JSON.parse(savedDraft))
        } catch (e) {
          console.error("Erro ao carregar draft:", e)
        }
      }

      const savedSettings = localStorage.getItem("draftSettings")
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (e) {
          console.error("Erro ao carregar configurações:", e)
        }
      }
    }
  }, [])

  // Salvar draft no localStorage quando mudar
  useEffect(() => {
    if (draft && typeof window !== "undefined") {
      localStorage.setItem("currentDraft", JSON.stringify(draft))
    }
  }, [draft])

  // Salvar configurações no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("draftSettings", JSON.stringify(settings))
    }
  }, [settings])

  // Criar um novo draft
  const createDraft = useCallback(
    (player1Name: string, player2Name: string): string => {
      const draftId = uuidv4()
      const newDraft: DraftState = {
        id: draftId,
        phase: "preban" as DraftPhase,
        turn: "player1",
        player1: {
          id: "player1",
          name: player1Name,
          characters: [],
          bans: [],
        },
        player2: {
          id: "player2",
          name: player2Name,
          characters: [],
          bans: [],
        },
        prebans: [],
        picks: {
          player1: [],
          player2: [],
        },
        currentPick: 0,
        maxPicks: settings.maxPicks,
        maxBans: settings.maxBans,
        completed: false,
        winner: null,
      }

      setDraft(newDraft)
      return draftId
    },
    [settings],
  )

  // Atualizar o draft
  const updateDraft = useCallback((updatedDraft: Partial<DraftState>) => {
    setDraft((prev) => {
      if (!prev) return null
      return { ...prev, ...updatedDraft }
    })
  }, [])

  // Atualizar as configurações
  const updateSettings = useCallback((updatedSettings: Partial<DraftSettings>) => {
    setSettings((prev) => ({ ...prev, ...updatedSettings }))
  }, [])

  // Resetar o draft
  const resetDraft = useCallback(() => {
    setDraft(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentDraft")
    }
  }, [])

  // Calcular pontos para um personagem
  const calculatePoints = useCallback(
    (characterId: string): number => {
      // Implementação básica - pode ser expandida conforme necessário
      return settings.characterCosts[characterId] || 0
    },
    [settings],
  )

  return (
    <DraftContext.Provider
      value={{
        draft,
        settings,
        createDraft,
        updateDraft,
        updateSettings,
        resetDraft,
        calculatePoints,
      }}
    >
      {children}
    </DraftContext.Provider>
  )
}

// Hook para usar o contexto do draft
export function useDraft() {
  const context = useContext(DraftContext)
  if (context === undefined) {
    throw new Error("useDraft must be used within a DraftProvider")
  }
  return context
}

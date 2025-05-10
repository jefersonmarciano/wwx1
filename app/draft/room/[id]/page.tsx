"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useDraft } from "@/hooks/use-draft"
import DraftPickBanInterface from "@/components/draft/draft-pick-ban-interface"

export default function DraftRoomPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters, isLoading: charactersLoading } = useCharacters()
  const {
    draftState,
    selectCharacter,
    banCharacter,
    skipTurn,
    isPlayerTurn,
    currentPhase,
    isLoading: draftLoading,
  } = useDraft(params.id)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || charactersLoading || draftLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DraftPickBanInterface
        player1="ODINZADA"
        player2="ARTHUROBS2"
        player1Costs={{ agent: 917, engine: 64.75 }}
        player2Costs={{ agent: 1354, engine: 148.75 }}
        timer={{
          player1: { minutes: 0, seconds: 40 },
          player2: { minutes: 0, seconds: 45 },
          global: { minutes: 2, seconds: 30 },
        }}
        draftState={draftState}
        characters={characters}
        onSelectCharacter={selectCharacter}
        onBan={banCharacter}
        onSkipTurn={skipTurn}
        isPlayerTurn={isPlayerTurn}
        currentPhase={currentPhase}
      />
    </div>
  )
}

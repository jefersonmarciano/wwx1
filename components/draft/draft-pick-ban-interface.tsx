"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Character } from "@/types/character"
import Image from "next/image"

interface DraftPickBanInterfaceProps {
  player1: string
  player2: string
  player1Costs: {
    agent: number
    engine: number
  }
  player2Costs: {
    agent: number
    engine: number
  }
  timer: {
    player1: {
      minutes: number
      seconds: number
    }
    player2: {
      minutes: number
      seconds: number
    }
    global: {
      minutes: number
      seconds: number
    }
  }
  draftState: {
    prebans: (Character | null)[]
    team1Picks: (Character | null)[]
    team2Picks: (Character | null)[]
    currentTurn: "player1" | "player2"
    phase: "preban" | "pick" | "complete"
  }
  characters: Character[]
  onSelectCharacter: (character: Character) => void
  onBan: (character: Character) => void
  onSkipTurn: () => void
  isPlayerTurn: boolean
  currentPhase: string
}

export default function DraftPickBanInterface({
  player1,
  player2,
  player1Costs,
  player2Costs,
  timer,
  draftState,
  characters,
  onSelectCharacter,
  onBan,
  onSkipTurn,
  isPlayerTurn,
  currentPhase,
}: DraftPickBanInterfaceProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<Character | null>(null)
  const [characterRows, setCharacterRows] = useState<Character[][]>([])
  const [displayedTeams, setDisplayedTeams] = useState({
    team1: { main: [] as Character[], reserve: [] as Character[] },
    team2: { main: [] as Character[], reserve: [] as Character[] },
  })

  // Organizar personagens em linhas para exibição
  useEffect(() => {
    const filteredCharacters = selectedFilter
      ? characters.filter((char) => char.element === selectedFilter)
      : characters

    // Organizar em linhas para melhor visualização
    const rows: Character[][] = []
    const maxPerRow = 9 // Número de personagens por linha

    // Dividir personagens em linhas
    for (let i = 0; i < filteredCharacters.length; i += maxPerRow) {
      rows.push(filteredCharacters.slice(i, i + maxPerRow))
    }

    setCharacterRows(rows)
  }, [characters, selectedFilter])

  // Função para renderizar os prebans
  const renderPrebans = () => {
    return (
      <div className="flex items-center gap-2">
        {draftState.prebans.map((preban, index) => (
          <div key={index} className="w-16 h-16 relative">
            {preban ? (
              <div className="h-full w-full rounded-md overflow-hidden border-2 border-purple-500">
                <Image
                  src={preban.imagePath || "/placeholder.svg"}
                  alt={preban.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-full w-full rounded-md border border-purple-800 bg-gray-900 flex items-center justify-center">
                <span className="text-purple-800 text-xl font-bold">{4 - index}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Função para renderizar os picks
  const renderPicks = () => {
    // Organizar os picks em uma grade 2x4 como na imagem
    const grid = []

    // Cores diferentes para os diferentes picks
    const getClass = (rowIndex: number, colIndex: number) => {
      // Identifica as cores com base no índice (como na imagem de referência)
      if (rowIndex === 0) {
        if (colIndex === 3) return "border-red-500 bg-red-900/30" // Vermelho
        return "border-gray-700 bg-gray-800/70" // Padrão
      } else if (rowIndex === 1) {
        if (colIndex === 2) return "border-blue-500 bg-blue-900/30" // Azul
        if (colIndex === 3) return "border-red-500 bg-red-900/30" // Vermelho
        return "border-gray-700 bg-gray-800/70" // Padrão
      }
      return "border-gray-700 bg-gray-800/70" // Padrão para outros casos
    }

    // Criar a grade de seleção de picks
    for (let row = 0; row < 2; row++) {
      const rowPicks = []
      for (let col = 0; col < 4; col++) {
        const pickNumber = row * 4 + col + 5 // Começa em 5 como na imagem
        const colorClass = getClass(row, col)

        rowPicks.push(
          <div
            key={`pick-${row}-${col}`}
            className={`w-16 h-16 rounded-md border flex items-center justify-center text-2xl font-bold ${colorClass}`}
          >
            {pickNumber}
          </div>,
        )
      }
      grid.push(
        <div key={`row-${row}`} className="flex gap-2">
          {rowPicks}
        </div>,
      )
    }

    return (
      <div className="flex justify-center gap-16">
        {/* Lado esquerdo (team1) */}
        <div className="space-y-2">{grid}</div>

        <div className="flex flex-col justify-center">
          <span className="text-white font-bold uppercase">PICKS</span>
        </div>

        {/* Lado direito (team2) */}
        <div className="space-y-2">{grid}</div>
      </div>
    )
  }

  // Função para renderizar os times selecionados
  const renderTeams = () => {
    // Filtra apenas picks que não são null
    const team1Picks = draftState.team1Picks.filter((pick): pick is Character => pick !== null)
    const team2Picks = draftState.team2Picks.filter((pick): pick is Character => pick !== null)

    return (
      <div className="flex justify-center gap-12 mt-6">
        {/* Time 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">TEAM 01</h3>
          <div className="flex gap-2">
            {team1Picks.map((character, index) => (
              <div key={`team1-${index}`} className="relative">
                <div className="w-28 h-28 rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/80">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">{character.name}</div>
                    <div className="text-xs text-white">Lv.60</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{character.element}</span>
                    <span className="text-xs">M{index}</span>
                  </div>
                </div>
                <div className="absolute top-1 left-1 flex">
                  {character.element === "Aero" && <span className="text-teal-400 text-xs">🌪️</span>}
                  {character.element === "Espectro" && <span className="text-yellow-400 text-xs">☀️</span>}
                  {character.element === "Glacio" && <span className="text-blue-400 text-xs">❄️</span>}
                  {character.element === "Devastação" && <span className="text-pink-400 text-xs">🎯</span>}
                  {character.element === "Fusão" && <span className="text-orange-400 text-xs">🔥</span>}
                  {character.element === "Eletro" && <span className="text-purple-400 text-xs">⚡</span>}
                </div>
                <div className="absolute top-1 right-1 bg-black/50 rounded px-1 text-xs">{character.rarity}★</div>
              </div>
            ))}
            {/* Placeholders para slots vazios */}
            {Array.from({ length: Math.max(0, 3 - team1Picks.length) }).map((_, index) => (
              <div
                key={`team1-empty-${index}`}
                className="w-28 h-28 rounded-md bg-gray-800/50 border border-dashed border-gray-700 flex items-center justify-center"
              >
                <span className="text-gray-600 text-2xl">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">TEAM 02</h3>
          <div className="flex gap-2">
            {team2Picks.map((character, index) => (
              <div key={`team2-${index}`} className="relative">
                <div className="w-28 h-28 rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/80">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">{character.name}</div>
                    <div className="text-xs text-white">Lv.60</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{character.element}</span>
                    <span className="text-xs">M{index}</span>
                  </div>
                </div>
                <div className="absolute top-1 left-1 flex">
                  {character.element === "Aero" && <span className="text-teal-400 text-xs">🌪️</span>}
                  {character.element === "Espectro" && <span className="text-yellow-400 text-xs">☀️</span>}
                  {character.element === "Glacio" && <span className="text-blue-400 text-xs">❄️</span>}
                  {character.element === "Devastação" && <span className="text-pink-400 text-xs">🎯</span>}
                  {character.element === "Fusão" && <span className="text-orange-400 text-xs">🔥</span>}
                  {character.element === "Eletro" && <span className="text-purple-400 text-xs">⚡</span>}
                </div>
                <div className="absolute top-1 right-1 bg-black/50 rounded px-1 text-xs">{character.rarity}★</div>
              </div>
            ))}
            {/* Placeholders para slots vazios */}
            {Array.from({ length: Math.max(0, 3 - team2Picks.length) }).map((_, index) => (
              <div
                key={`team2-empty-${index}`}
                className="w-28 h-28 rounded-md bg-gray-800/50 border border-dashed border-gray-700 flex items-center justify-center"
              >
                <span className="text-gray-600 text-2xl">+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Função para renderizar os personagens
  const renderCharacters = () => {
    return (
      <div className="mt-4 mb-4">
        {characterRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex justify-center gap-1 mb-1">
            {row.map((character) => {
              const isSelected = [
                ...draftState.prebans.filter(Boolean).map((p) => p!.id),
                ...draftState.team1Picks.filter(Boolean).map((p) => p!.id),
                ...draftState.team2Picks.filter(Boolean).map((p) => p!.id),
              ].includes(character.id)

              return (
                <div
                  key={character.id}
                  className={`relative cursor-pointer transition-all ${isSelected ? "opacity-50" : "hover:opacity-90"}`}
                  onClick={() => !isSelected && isPlayerTurn && onSelectCharacter(character)}
                  onMouseEnter={() => setHoveredCharacter(character)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <div className="w-12 h-12 rounded-md bg-gray-800 overflow-hidden relative">
                    {/* Imagem do personagem */}
                    {character.imagePath ? (
                      <Image
                        src={character.imagePath || "/placeholder.svg"}
                        alt={character.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        {character.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-full text-center text-xs text-white bg-black/50">60</div>
                    <div className="absolute bottom-0 right-0 text-xs bg-black/50 px-1 text-white">
                      M{Math.floor(Math.random() * 3)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Função para renderizar os filtros de elemento
  const renderElementFilters = () => {
    const elements = ["Aero", "Espectro", "Glacio", "Devastação", "Fusão", "Eletro"]
    const elementIcons = ["🌪️", "☀️", "❄️", "🎯", "🔥", "⚡"]

    return (
      <div className="flex justify-center gap-4 mt-4 mb-2">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md">≡</button>
          {elements.map((element, index) => (
            <button
              key={element}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${selectedFilter === element ? "bg-purple-700" : "bg-gray-800"}`}
              onClick={() => setSelectedFilter(selectedFilter === element ? null : element)}
            >
              {elementIcons[index]}
            </button>
          ))}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md">≡</button>
          {elements.map((element, index) => (
            <button
              key={`right-${element}`}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${selectedFilter === element ? "bg-purple-700" : "bg-gray-800"}`}
              onClick={() => setSelectedFilter(selectedFilter === element ? null : element)}
            >
              {elementIcons[index]}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Renderizar a interface completa
  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col">
      {/* Header com nomes dos jogadores e timers */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <div className="text-2xl font-bold">{player1}</div>
          <div className="text-sm">Agent costs: {player1Costs.agent}</div>
          <div className="text-sm">Engine costs: {player1Costs.engine}</div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold">
            {timer.player1.minutes}:{String(timer.player1.seconds).padStart(2, "0")}
          </div>
          <div className="bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold border-2 border-orange-500">
            07
          </div>
          <div className="text-2xl font-bold">
            {timer.player2.minutes}:{String(timer.player2.seconds).padStart(2, "0")}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold">{player2}</div>
          <div className="text-sm">Agent costs: {player2Costs.agent}</div>
          <div className="text-sm">Engine costs: {player2Costs.engine}</div>
        </div>
      </div>

      {/* Seção de Prebans */}
      <div className="mt-6 flex justify-center items-center">
        {renderPrebans()}
        <div className="ml-4 text-white font-bold uppercase">PREBANS</div>
      </div>

      {/* Seção de Picks */}
      <div className="mt-6">{renderPicks()}</div>

      {/* Mostrar os times selecionados quando existirem picks */}
      {(draftState.team1Picks.some((pick) => pick !== null) || draftState.team2Picks.some((pick) => pick !== null)) && (
        <div className="mt-6">{renderTeams()}</div>
      )}

      {/* Mensagem de instrução */}
      <div className="mt-4 text-white text-lg text-center">
        {isPlayerTurn ? "Please select an agent..." : "Waiting for opponent..."}
      </div>

      {/* Filtros de elemento */}
      {renderElementFilters()}

      {/* Grid de personagens */}
      {renderCharacters()}

      {/* Controles inferiores */}
      <div className="mt-auto flex justify-between pt-4">
        <div></div>
        <Button
          variant="outline"
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          onClick={() => hoveredCharacter && onBan(hoveredCharacter)}
          disabled={!isPlayerTurn}
        >
          Ban
        </Button>
        <Button
          variant="outline"
          className="bg-gray-800 border-gray-700 text-red-500 hover:bg-gray-700"
          onClick={onSkipTurn}
          disabled={!isPlayerTurn}
        >
          Skip turn
        </Button>
      </div>

      {/* Controles adicionais de custo e pronto */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span>Max cost: 45</span>
          <span>Cost: 0</span>
        </div>
        <Button variant="outline" className="bg-yellow-900/50 border-yellow-500 text-yellow-500">
          Not ready
        </Button>
      </div>

      {/* Tooltip para mostrar informações do personagem ao passar o mouse */}
      {hoveredCharacter && (
        <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-md p-4 shadow-lg z-50 max-w-xs">
          <div className="flex gap-3">
            {hoveredCharacter.imagePath && (
              <div className="w-16 h-16 rounded-md overflow-hidden">
                <Image
                  src={hoveredCharacter.imagePath || "/placeholder.svg"}
                  alt={hoveredCharacter.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div>
              <h3 className="font-bold text-white">{hoveredCharacter.name}</h3>
              <div className="text-sm text-gray-300">
                {hoveredCharacter.rarity}★ | {hoveredCharacter.tier} | {hoveredCharacter.element}
              </div>
              <div className="text-sm text-gray-400">{hoveredCharacter.weapon}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

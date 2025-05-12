"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useDraft } from "@/hooks/use-draft"
import { useTeams } from "@/hooks/use-teams"
import { Button } from "@/components/ui/button"
import { Ban, Shield, Zap, Wind, Flame, Sun, Snowflake, Target, Filter } from "lucide-react"
import Image from "next/image"
import type { Deck } from "@/types/team"
import type { Character } from "@/types/character"

export default function DraftRoomPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { teams, getDecks } = useTeams()
  const { draft, settings, createDraft } = useDraft()

  // Usar uma ref para controlar se o draft já foi criado
  const draftCreatedRef = useRef(false)

  // Draft state
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [opponentDeck, setOpponentDeck] = useState<Deck | null>(null)
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(true)
  const [enablePrebans, setEnablePrebans] = useState(searchParams?.get("prebans") === "true")
  const [currentTurn, setCurrentTurn] = useState<"player1" | "player2">("player1")
  const [currentPickIndex, setCurrentPickIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [additionalTimeLeft, setAdditionalTimeLeft] = useState(230)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeFilterOpponent, setActiveFilterOpponent] = useState<string | null>(null)

  // Characters state
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [availableCharactersOpponent, setAvailableCharactersOpponent] = useState<Character[]>([])

  // Armazenar os personagens selecionados em cada posição específica
  const [pickSlots, setPickSlots] = useState<{
    [key: number]: Character | null
  }>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: null,
    16: null,
  })

  // Player info
  const [player1Name, setPlayer1Name] = useState("DASDSAD")
  const [player2Name, setPlayer2Name] = useState("SDSADAS")
  const [player1AgentCost, setPlayer1AgentCost] = useState(1618)
  const [player2AgentCost, setPlayer2AgentCost] = useState(1618)
  const [player1EngineCost, setPlayer1EngineCost] = useState(434)
  const [player2EngineCost, setPlayer2EngineCost] = useState(434)

  const decks = getDecks()

  // Definir a ordem exata de picks e bans
  const pickOrder = [
    // Banimentos iniciais
    { number: 1, type: "ban", player: "player1" },
    { number: 2, type: "ban", player: "player2" },

    // Picks iniciais
    { number: 3, type: "pick", player: "player1" },
    { number: 4, type: "pick", player: "player2" },
    { number: 5, type: "pick", player: "player1" },
    { number: 6, type: "pick", player: "player2" },
    { number: 7, type: "pick", player: "player1" },
    { number: 8, type: "pick", player: "player2" },

    // Banimentos do meio
    { number: 9, type: "ban", player: "player1" },
    { number: 10, type: "ban", player: "player2" },
    
    // Picks finais (ordem ajustada conforme a imagem)
    { number: 11, type: "pick", player: "player2" },
    { number: 12, type: "pick", player: "player1" },
    { number: 13, type: "pick", player: "player2" },
    { number: 14, type: "pick", player: "player1" },
    { number: 15, type: "pick", player: "player2" },
    { number: 16, type: "pick", player: "player1" },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Inicializar o draft quando a página carrega - com verificação para evitar loop infinito
  useEffect(() => {
    // Só criar o draft uma vez usando a ref
    if (params.id && isAuthenticated && !draftCreatedRef.current && !draft) {
      draftCreatedRef.current = true
      createDraft("Player 1", "Player 2")
    }
  }, [params.id, isAuthenticated, createDraft, draft])

  // Quando um deck é selecionado, carregamos os personagens disponíveis
  useEffect(() => {
    if (selectedDeck) {
      const deckCharacters = selectedDeck.characters
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean) as Character[]

      setAvailableCharacters(deckCharacters)
    }

    if (opponentDeck) {
      const opponentDeckCharacters = opponentDeck.characters
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean) as Character[]

      setAvailableCharactersOpponent(opponentDeckCharacters)
    }
  }, [selectedDeck, opponentDeck, characters])

  // Timer para o turno
  useEffect(() => {
    if (currentPickIndex < pickOrder.length) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (additionalTimeLeft > 0) {
              setAdditionalTimeLeft((prevAdd) => prevAdd - 1)
              return 0
            }
            // Auto skip turn if time runs out
            handleSkipTurn()
            return 45
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentPickIndex, additionalTimeLeft])

  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(45)
  }, [currentTurn, currentPickIndex])

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck)

    // Selecionar um deck aleatório para o oponente
    const remainingDecks = decks.filter((d) => d.id !== deck.id)
    if (remainingDecks.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingDecks.length)
      setOpponentDeck(remainingDecks[randomIndex] as Deck)
    } else if (decks.length > 0) {
      // Se não houver outros decks, usar o mesmo
      setOpponentDeck(deck)
    }

    setIsDeckSelectorOpen(false)
    setCurrentPickIndex(0)
    setCurrentTurn("player1")
  }

  // Verificar se um personagem já foi selecionado
  const isCharacterSelected = (character: Character) => {
    return Object.values(pickSlots).some((char) => char !== null && char.id === character.id)
  }

  // Obter o número do slot onde o personagem está
  const getSlotForCharacter = (character: Character) => {
    for (const [slot, char] of Object.entries(pickSlots)) {
      if (char !== null && char.id === character.id) {
        return Number.parseInt(slot)
      }
    }
    return null
  }

  // Verificar se é um slot de ban
  const isBanSlot = (slotNumber: number) => {
    return [1, 2, 9, 10].includes(slotNumber)
  }

  // Verificar se é um slot do jogador 1
  const isPlayer1Slot = (slotNumber: number) => {
    return [1, 3, 5, 7, 9, 12, 14, 16].includes(slotNumber)
  }

  // Verificar se é um slot do jogador 2
  const isPlayer2Slot = (slotNumber: number) => {
    return [2, 4, 6, 8, 10, 11, 13, 15].includes(slotNumber)
  }

  // Handle character selection
  const handleCharacterSelect = (character: Character, side: "player1" | "player2") => {
    // Verificar se o personagem já foi selecionado
    if (isCharacterSelected(character)) {
      return
    }

    // Verificar se estamos no final do draft
    if (currentPickIndex >= pickOrder.length) {
      return
    }

    // Obter o slot atual
    const currentSlot = pickOrder[currentPickIndex]

    // Verificar se o jogador correto está selecionando
    if (currentSlot.player !== side) {
      return
    }

    // Adicionar o personagem ao slot correspondente
    setPickSlots((prev) => ({
      ...prev,
      [currentSlot.number]: character,
    }))

    // Avançar para o próximo pick
    setCurrentPickIndex(currentPickIndex + 1)

    // Alternar o turno
    setCurrentTurn(currentTurn === "player1" ? "player2" : "player1")
  }

  // Handle skip turn
  const handleSkipTurn = () => {
    // Verificar se estamos no final do draft
    if (currentPickIndex >= pickOrder.length) {
      return
    }

    // Avançar para o próximo pick
    setCurrentPickIndex(currentPickIndex + 1)

    // Alternar o turno
    setCurrentTurn(currentTurn === "player1" ? "player2" : "player1")
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Get element icon
  const getElementIcon = (element: string) => {
    switch (element) {
      case "Fusão":
        return <Flame className="h-4 w-4 text-orange-400" />
      case "Glacio":
        return <Snowflake className="h-4 w-4 text-blue-400" />
      case "Aero":
        return <Wind className="h-4 w-4 text-teal-400" />
      case "Eletro":
        return <Zap className="h-4 w-4 text-purple-400" />
      case "Espectro":
        return <Sun className="h-4 w-4 text-yellow-400" />
      case "Devastação":
        return <Target className="h-4 w-4 text-pink-400" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  // Filter characters by element
  const filteredCharacters = activeFilter
    ? availableCharacters.filter((char) => char.element === activeFilter)
    : availableCharacters

  const filteredCharactersOpponent = activeFilterOpponent
    ? availableCharactersOpponent.filter((char) => char.element === activeFilterOpponent)
    : availableCharactersOpponent

  // Renderizar seletor de deck
  if (isDeckSelectorOpen) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Selecione um Deck para o Torneio</h1>

          {decks.length === 0 ? (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <p className="text-lg mb-4">Você não possui nenhum deck de torneio.</p>
              <Button onClick={() => router.push("/teams")}>Criar um Deck</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const deckCharacters = deck.characters
                  .map((id) => characters.find((c) => c.id === id))
                  .filter(Boolean) as Character[]

                return (
                  <div
                    key={deck.id}
                    className="bg-gray-800 border border-yellow-600/30 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectDeck(deck as Deck)}
                  >
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                      <h3 className="text-lg font-bold">{deck.name}</h3>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span>{deckCharacters.length} personagens</span>
                      <span>Custo: {deck.totalCost}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {deckCharacters.slice(0, 5).map((character) => (
                        <div key={character.id} className="aspect-square bg-gray-900 rounded overflow-hidden">
                          {character.imagePath && (
                            <Image
                              src={character.imagePath || "/placeholder.svg"}
                              alt={character.name}
                              width={60}
                              height={60}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {deckCharacters.length > 5 && (
                        <div className="aspect-square bg-gray-900 rounded flex items-center justify-center">
                          <span>+{deckCharacters.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar a ordem de picks (exatamente como na imagem)
  const renderPickOrder = () => {
    // Exatamente como na imagem:
    // Primeira linha: 7, 6, 3, 1, 2, 4, 5, 8
    // Segunda linha: 16, 13, 12, 9, 10, 11, 14, 15
    
    // Modificado para trocar as posições 6 e 5, e 13 e 14
    const firstRow = [7, 5, 3, 1, 2, 4, 6, 8]
    const secondRow = [16, 14, 12, 9, 10, 11, 13, 15]

    return (
      <div className="flex flex-col items-center mb-4">
        <div className="flex justify-center gap-1 mb-1">
          {firstRow.map((num, index) => {
            const isBan = isBanSlot(num)
            const isPlayer1 = isPlayer1Slot(num)
            const isPlayer2 = isPlayer2Slot(num)
            const isHighlighted = [1, 2].includes(num)
            const isCurrentPick = currentPickIndex < pickOrder.length && pickOrder[currentPickIndex].number === num
            const character = pickSlots[num]
            
            // Add margin between 1 and 2
            const shouldAddMarginRight = num === 1
            const shouldAddMarginLeft = num === 2

            return (
              <div
                key={`pick-${num}`}
                className={`
                  w-16 h-16 rounded-md flex items-center justify-center text-3xl font-bold relative
                  ${isHighlighted ? "bg-red-500 text-white" : "bg-gray-800"}
                  ${isPlayer1 && !isBan ? "text-blue-500" : ""}
                  ${isPlayer2 && !isBan ? "text-red-500" : ""}
                  ${!isPlayer1 && !isPlayer2 && !isBan ? "text-gray-500" : ""}
                  ${isCurrentPick ? "ring-2 ring-white" : ""}
                  ${shouldAddMarginRight ? "mr-3" : ""}
                  ${shouldAddMarginLeft ? "ml-3" : ""}
                `}
              >
                {character ? (
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    {isBan && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <Ban className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-center text-xs py-1">
                      {character.name}
                    </div>
                  </div>
                ) : (
                  num
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-1">
          {secondRow.map((num) => {
            const isBan = isBanSlot(num)
            const isPlayer1 = isPlayer1Slot(num)
            const isPlayer2 = isPlayer2Slot(num)
            const isHighlighted = [9, 10].includes(num)
            const isCurrentPick = currentPickIndex < pickOrder.length && pickOrder[currentPickIndex].number === num
            const character = pickSlots[num]
            
            // Add margin between 9 and 10
            const shouldAddMarginRight = num === 9
            const shouldAddMarginLeft = num === 10

            return (
              <div
                key={`pick-${num}`}
                className={`
                  w-16 h-16 rounded-md flex items-center justify-center text-3xl font-bold relative
                  ${isHighlighted ? "bg-red-500 text-white" : "bg-gray-800"}
                  ${isPlayer1 && !isBan ? "text-blue-500" : ""}
                  ${isPlayer2 && !isBan ? "text-red-500" : ""}
                  ${!isPlayer1 && !isPlayer2 && !isBan ? "text-gray-500" : ""}
                  ${isCurrentPick ? "ring-2 ring-white" : ""}
                  ${shouldAddMarginRight ? "mr-3" : ""}
                  ${shouldAddMarginLeft ? "ml-3" : ""}
                `}
              >
                {character ? (
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    {isBan && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <Ban className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-center text-xs py-1">
                      {character.name}
                    </div>
                  </div>
                ) : (
                  num
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center mt-2 text-xl font-bold">PICKS</div>
      </div>
    )
  }

  // Renderizar mensagem de fase atual
  const renderPhaseMessage = () => {
    if (currentPickIndex >= pickOrder.length) {
      return "Draft completo!"
    }

    const currentSlot = pickOrder[currentPickIndex]
    const playerName = currentSlot.player === "player1" ? player1Name : player2Name
    const actionType = currentSlot.type === "ban" ? "ban" : "select"
    
    return `${playerName}'s turn to ${actionType} an agent...`
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header com informações dos jogadores */}
      <div className="flex justify-between items-center p-4 bg-black">
        <div className={`text-center ${currentTurn === "player1" ? "ring-2 ring-blue-500 rounded-lg p-2" : ""}`}>
          <div className="text-xl font-bold">{player1Name}</div>
          <div className="text-sm text-gray-400">
            Agent costs: {player1AgentCost}
            <br />
            Engine costs: {player1EngineCost}
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? "bg-gray-500" : "bg-red-500"}`} />
              ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex gap-4">
            <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white text-xl font-bold">
              07
            </div>
            <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
          </div>
          <div className="text-sm text-gray-400">{formatTime(additionalTimeLeft)}</div>
        </div>

        <div className={`text-center ${currentTurn === "player2" ? "ring-2 ring-red-500 rounded-lg p-2" : ""}`}>
          <div className="text-xl font-bold">{player2Name}</div>
          <div className="text-sm text-gray-400">
            Agent costs: {player2AgentCost}
            <br />
            Engine costs: {player2EngineCost}
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? "bg-gray-500" : "bg-red-500"}`} />
              ))}
          </div>
        </div>
      </div>

      {/* Ordem de picks */}
      {renderPickOrder()}

      {/* Mensagem de fase atual */}
      <div className="flex justify-between items-center px-8 py-2">
        <div className="text-white text-lg">{renderPhaseMessage()}</div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            disabled={currentPickIndex >= pickOrder.length || pickOrder[currentPickIndex].type !== "ban"}
          >
            Ban
          </Button>
          <Button
            variant="outline"
            className="bg-red-900/30 text-red-500 border-red-900/50 hover:bg-red-900/50"
            onClick={handleSkipTurn}
            disabled={currentPickIndex >= pickOrder.length}
          >
            Skip turn
          </Button>
        </div>
      </div>

      {/* Área de seleção de personagens */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {/* Lado do Jogador 1 */}
        <div className="bg-black p-2 rounded-lg">
          {/* Filtros */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter(null)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Shield")}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Devastação")}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Aero")}
            >
              <Wind className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Glacio")}
            >
              <Snowflake className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Fusão")}
            >
              <Flame className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Espectro")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Eletro")}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid de personagens */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1">
            {filteredCharacters.map((character) => {
              const isSelected = isCharacterSelected(character)
              const slotNumber = isSelected ? getSlotForCharacter(character) : null
              const isBan = slotNumber ? isBanSlot(slotNumber) : false
              const isCurrentTurnPlayer =
                currentPickIndex < pickOrder.length && pickOrder[currentPickIndex].player === "player1"

              return (
                <div
                  key={character.id}
                  className={`
                    aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                    ${isSelected ? "opacity-50 pointer-events-none" : ""}
                    ${!isSelected && isCurrentTurnPlayer ? "hover:opacity-80" : "hover:opacity-100"}
                    ${!isCurrentTurnPlayer ? "cursor-not-allowed" : ""}
                  `}
                  onClick={() => isCurrentTurnPlayer && handleCharacterSelect(character, "player1")}
                >
                  {character.imagePath && (
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Nível e raridade */}
                  <div className="absolute top-0 left-0 w-full flex justify-between items-center p-1">
                    <span className="text-xs bg-black/60 px-1 rounded">60</span>
                    <span className="text-xs bg-black/60 px-1 rounded">MO</span>
                  </div>

                  {/* Nome do personagem */}
                  <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                    <div className="text-xs text-white truncate">{character.name}</div>
                  </div>

                  {isSelected && isBan && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <Ban className="h-8 w-8 text-red-500" />
                    </div>
                  )}

                  {isSelected && slotNumber && (
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-500">{slotNumber}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Lado do Jogador 2 */}
        <div className="bg-black p-2 rounded-lg">
          {/* Filtros */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent(null)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Shield")}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Devastação")}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Aero")}
            >
              <Wind className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Glacio")}
            >
              <Snowflake className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Fusão")}
            >
              <Flame className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Espectro")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Eletro")}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid de personagens */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1">
            {filteredCharactersOpponent.length > 0
              ? filteredCharactersOpponent.map((character) => {
                  const isSelected = isCharacterSelected(character)
                  const slotNumber = isSelected ? getSlotForCharacter(character) : null
                  const isBan = slotNumber ? isBanSlot(slotNumber) : false
                  const isCurrentTurnPlayer =
                    currentPickIndex < pickOrder.length && pickOrder[currentPickIndex].player === "player2"

                  return (
                    <div
                      key={character.id}
                      className={`
                        aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                        ${isSelected ? "opacity-50 pointer-events-none" : ""}
                        ${!isSelected && isCurrentTurnPlayer ? "hover:opacity-80" : "hover:opacity-100"}
                        ${!isCurrentTurnPlayer ? "cursor-not-allowed" : ""}
                      `}
                      onClick={() => isCurrentTurnPlayer && handleCharacterSelect(character, "player2")}
                    >
                      {character.imagePath && (
                        <Image
                          src={character.imagePath || "/placeholder.svg"}
                          alt={character.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Nível e raridade */}
                      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-1">
                        <span className="text-xs bg-black/60 px-1 rounded">60</span>
                        <span className="text-xs bg-black/60 px-1 rounded">MO</span>
                      </div>

                      {/* Nome do personagem */}
                      <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                        <div className="text-xs text-white truncate">{character.name}</div>
                      </div>

                      {isSelected && isBan && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <Ban className="h-8 w-8 text-red-500" />
                        </div>
                      )}

                      {isSelected && slotNumber && (
                        <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-500">{slotNumber}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              : // Se não houver personagens do oponente, usar os mesmos do jogador 1
                filteredCharacters.map((character) => {
                  const isSelected = isCharacterSelected(character)
                  const slotNumber = isSelected ? getSlotForCharacter(character) : null
                  const isBan = slotNumber ? isBanSlot(slotNumber) : false
                  const isCurrentTurnPlayer =
                    currentPickIndex < pickOrder.length && pickOrder[currentPickIndex].player === "player2"

                  return (
                    <div
                      key={character.id}
                      className={`
                        aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                        ${isSelected ? "opacity-50 pointer-events-none" : ""}
                        ${!isSelected && isCurrentTurnPlayer ? "hover:opacity-80" : "hover:opacity-100"}
                        ${!isCurrentTurnPlayer ? "cursor-not-allowed" : ""}
                      `}
                      onClick={() => isCurrentTurnPlayer && handleCharacterSelect(character, "player2")}
                    >
                      {character.imagePath && (
                        <Image
                          src={character.imagePath || "/placeholder.svg"}
                          alt={character.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Nível e raridade */}
                      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-1">
                        <span className="text-xs bg-black/60 px-1 rounded">60</span>
                        <span className="text-xs bg-black/60 px-1 rounded">MO</span>
                      </div>

                      {/* Nome do personagem */}
                      <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                        <div className="text-xs text-white truncate">{character.name}</div>
                      </div>

                      {isSelected && isBan && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <Ban className="h-8 w-8 text-red-500" />
                        </div>
                      )}

                      {isSelected && slotNumber && (
                        <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-500">{slotNumber}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
          </div>
        </div>
      </div>
    </div>
  )
}

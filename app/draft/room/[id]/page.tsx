"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useDraft } from "@/hooks/use-draft"
import { useTeams } from "@/hooks/use-teams"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Ban, Shield, Wind, Sun, Snowflake, Target, Flame, Zap } from "lucide-react"
import Image from "next/image"
import type { Deck } from "@/types/team"
import type { Character } from "@/types/character"

export default function DraftRoomPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { teams, getDecks } = useTeams()
  const { draftState, settings, tournamentRules, selectCharacter, banCharacter, skipTurn, isMyTurn, createDraft } =
    useDraft()

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(true)
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [prebans, setPrebans] = useState<Character[]>([])
  const [isPrebanning, setIsPrebanning] = useState(true)
  const [selectedPrebans, setSelectedPrebans] = useState<Character[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [additionalTimeLeft, setAdditionalTimeLeft] = useState(180)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])
  const [opponentCharacters, setOpponentCharacters] = useState<Character[]>([])
  const [currentPickIndex, setCurrentPickIndex] = useState(0)
  const [isPickPhase, setIsPickPhase] = useState(false)

  const decks = getDecks()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Inicializar o draft quando a página carrega
  useEffect(() => {
    if (params.id && isAuthenticated) {
      createDraft("Player 1", "Player 2")
    }
  }, [params.id, isAuthenticated, createDraft])

  // Quando um deck é selecionado, carregamos os personagens disponíveis
  useEffect(() => {
    if (selectedDeck) {
      const deckCharacters = selectedDeck.characters
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean) as Character[]

      setAvailableCharacters(deckCharacters)
    }
  }, [selectedDeck, characters])

  // Timer para o turno
  useEffect(() => {
    if (isPickPhase) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (additionalTimeLeft > 0) {
              setAdditionalTimeLeft((prevAdd) => prevAdd - 1)
              return 0
            }
            // Auto skip turn if time runs out
            skipTurn()
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPickPhase, additionalTimeLeft, skipTurn])

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setIsDeckSelectorOpen(false)
    setIsPrebanning(true)
  }

  const handleSelectPreban = (character: Character) => {
    if (selectedPrebans.find((c) => c.id === character.id)) {
      setSelectedPrebans(selectedPrebans.filter((c) => c.id !== character.id))
    } else if (selectedPrebans.length < 3) {
      setSelectedPrebans([...selectedPrebans, character])
    }
  }

  const handleConfirmPrebans = () => {
    setPrebans(selectedPrebans)
    setIsPrebanning(false)
    setIsPickPhase(true)

    // Remover os personagens banidos da lista de disponíveis
    const filteredCharacters = availableCharacters.filter(
      (char) => !selectedPrebans.find((banned) => banned.id === char.id),
    )
    setAvailableCharacters(filteredCharacters)
  }

  const handleSelectPickCharacter = (character: Character) => {
    // Verificar se é a vez do jogador e se o personagem não foi selecionado
    if (isMyTurn() && !selectedCharacters.find((c) => c.id === character.id) && selectedCharacters.length < 6) {
      setSelectedCharacters([...selectedCharacters, character])
      selectCharacter(character.id)

      // Simular a escolha do oponente
      setTimeout(() => {
        const availableForOpponent = availableCharacters.filter(
          (c) =>
            !selectedCharacters.find((sc) => sc.id === c.id) &&
            !opponentCharacters.find((oc) => oc.id === c.id) &&
            !character.id.includes(c.id),
        )

        if (availableForOpponent.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableForOpponent.length)
          const opponentPick = availableForOpponent[randomIndex]
          setOpponentCharacters([...opponentCharacters, opponentPick])
        }

        setCurrentPickIndex((prev) => prev + 1)
        setTimeLeft(60)
      }, 1000)
    }
  }

  const elementIcons = {
    Aero: <Wind className="h-4 w-4 text-teal-400" />,
    Espectro: <Sun className="h-4 w-4 text-yellow-400" />,
    Glacio: <Snowflake className="h-4 w-4 text-blue-400" />,
    Devastação: <Target className="h-4 w-4 text-pink-400" />,
    Fusão: <Flame className="h-4 w-4 text-orange-400" />,
    Eletro: <Zap className="h-4 w-4 text-purple-400" />,
  }

  // Filtrar personagens por elemento
  const filteredCharacters = activeFilter
    ? availableCharacters.filter((char) => char.element === activeFilter)
    : availableCharacters

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
                  <Card
                    key={deck.id}
                    className="bg-gray-800 border-yellow-600/30 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectDeck(deck as Deck)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                        {deck.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar fase de pré-bans
  if (isPrebanning) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Selecione 3 Pré-bans</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Personagens Selecionados ({selectedPrebans.length}/3)</h2>
            <div className="flex gap-2 mb-4">
              {Array.from({ length: 3 }).map((_, index) => {
                const preban = selectedPrebans[index]
                return (
                  <div
                    key={`preban-${index}`}
                    className="w-20 h-20 bg-gray-800 rounded-md overflow-hidden border-2 border-red-500"
                  >
                    {preban ? (
                      <Image
                        src={preban.imagePath || "/placeholder.svg"}
                        alt={preban.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-red-500">Ban {index + 1}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {availableCharacters.map((character) => {
              const isSelected = selectedPrebans.some((c) => c.id === character.id)
              return (
                <div
                  key={character.id}
                  className={`aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer ${
                    isSelected ? "ring-2 ring-red-500" : ""
                  }`}
                  onClick={() => handleSelectPreban(character)}
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
                  <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                    <div className="text-xs text-white truncate">{character.name}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleConfirmPrebans} disabled={selectedPrebans.length !== 3}>
              Confirmar Pré-bans
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar a sala de draft
  return (
    <div className="min-h-screen bg-black">
      <div className="flex justify-between items-center p-4 bg-gray-900">
        <div>
          <h2 className="font-bold">Deck: {selectedDeck?.name}</h2>
          <p className="text-sm text-gray-400">Personagens disponíveis: {availableCharacters.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Tempo restante</div>
            <div className="text-xl font-bold">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>
          <div>
            <h2 className="font-bold">Pré-bans</h2>
            <div className="flex gap-1">
              {prebans.map((character) => (
                <div key={character.id} className="w-8 h-8 bg-gray-800 rounded-md overflow-hidden">
                  {character.imagePath && (
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Seus Picks ({selectedCharacters.length}/6)</h2>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const character = selectedCharacters[index]
                return (
                  <div
                    key={`pick-${index}`}
                    className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden border border-blue-500"
                  >
                    {character ? (
                      <Image
                        src={character.imagePath || "/placeholder.svg"}
                        alt={character.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-500">{index + 1}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Picks do Oponente ({opponentCharacters.length}/6)</h2>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const character = opponentCharacters[index]
                return (
                  <div
                    key={`opponent-pick-${index}`}
                    className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden border border-red-500"
                  >
                    {character ? (
                      <Image
                        src={character.imagePath || "/placeholder.svg"}
                        alt={character.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-red-500">{index + 1}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Selecione seus personagens</h2>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className={activeFilter === null ? "bg-primary/20" : ""}
              onClick={() => setActiveFilter(null)}
            >
              Todos
            </Button>
            {Object.entries(elementIcons).map(([element, icon]) => (
              <Button
                key={element}
                variant="outline"
                size="sm"
                className={activeFilter === element ? "bg-primary/20" : ""}
                onClick={() => setActiveFilter(activeFilter === element ? null : element)}
              >
                {icon}
                <span className="ml-1">{element}</span>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredCharacters.map((character) => {
              const isSelected = selectedCharacters.some((c) => c.id === character.id)
              const isOpponentSelected = opponentCharacters.some((c) => c.id === character.id)
              const isBanned = prebans.some((c) => c.id === character.id)

              // Verificar se o personagem tem uma arma equipada
              const hasEquippedWeapon = character.equippedWeaponId !== null && character.equippedWeaponId !== undefined

              return (
                <TooltipProvider key={character.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                          ${isSelected ? "ring-2 ring-blue-500" : ""}
                          ${isOpponentSelected ? "ring-2 ring-red-500" : ""}
                          ${isBanned ? "opacity-50 pointer-events-none" : ""}
                          ${!isSelected && !isOpponentSelected && !isBanned ? "hover:opacity-80" : ""}
                        `}
                        onClick={() =>
                          !isSelected && !isOpponentSelected && !isBanned && handleSelectPickCharacter(character)
                        }
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
                        <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-xs">
                          {character.level}
                        </div>
                        <div className="absolute top-1 right-1 bg-black/60 px-1 py-0.5 rounded text-xs">
                          {character.rarity}★
                        </div>

                        {/* Mostrar constelação se tiver */}
                        {character.constellation > 0 && (
                          <div className="absolute bottom-6 right-1 bg-black/60 px-1 py-0.5 rounded text-xs">
                            C{character.constellation}
                          </div>
                        )}

                        {/* Mostrar arma equipada */}
                        {hasEquippedWeapon && (
                          <div className="absolute bottom-6 left-1">
                            <div className="w-5 h-5 bg-black/60 rounded-full overflow-hidden">
                              {weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath && (
                                <Image
                                  src={weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath || ""}
                                  alt="Arma equipada"
                                  width={20}
                                  height={20}
                                  className="object-contain w-full h-full p-0.5"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                          <div className="text-xs text-white truncate">{character.name}</div>
                        </div>

                        {isBanned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <Ban className="h-8 w-8 text-red-500" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <div className="font-bold">{character.name}</div>
                        <div className="text-sm">
                          {character.rarity}★ | {character.element} | Nível {character.level}
                        </div>
                        {character.constellation > 0 && (
                          <div className="text-sm">Constelação: {character.constellation}</div>
                        )}
                        {hasEquippedWeapon && (
                          <div className="text-sm">
                            Arma: {weapons.find((w) => w.id === character.equippedWeaponId)?.name}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/teams")}>
            Cancelar Draft
          </Button>

          <Button
            disabled={selectedCharacters.length < 6}
            onClick={() => {
              // Finalizar o draft
              alert("Draft finalizado! Seu time foi selecionado com sucesso.")
              router.push("/teams")
            }}
          >
            Finalizar Seleção
          </Button>
        </div>
      </div>
    </div>
  )
}

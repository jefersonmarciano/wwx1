"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Character } from "@/types/character"
import { Wind, Sun, Snowflake, Target, Flame, Zap, Filter } from "lucide-react"
import Image from "next/image"

interface CharacterSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (character: Character) => void
  characters: Character[]
  selectedCharacters: string[]
}

export default function CharacterSelector({
  open,
  onOpenChange,
  onSelect,
  characters,
  selectedCharacters,
}: CharacterSelectorProps) {
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [activeRarity, setActiveRarity] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const elementIcons = {
    Aero: <Wind className="h-5 w-5 text-teal-400" />,
    Espectro: <Sun className="h-5 w-5 text-yellow-400" />,
    Glacio: <Snowflake className="h-5 w-5 text-blue-400" />,
    Devastação: <Target className="h-5 w-5 text-pink-400" />,
    Fusão: <Flame className="h-5 w-5 text-orange-400" />,
    Eletro: <Zap className="h-5 w-5 text-purple-400" />,
  }

  const filteredCharacters = characters.filter((character) => {
    // Filter by element if active
    if (activeElement && character.element !== activeElement) {
      return false
    }

    // Filter by rarity if active
    if (activeRarity && character.rarity !== activeRarity) {
      return false
    }

    // Filter by search term
    if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar Personagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar personagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveElement(null)
                setActiveRarity(null)
                setSearchTerm("")
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Filtrar por Elemento</div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="all" onClick={() => setActiveElement(null)}>
                  Todos
                </TabsTrigger>
                {Object.entries(elementIcons).map(([element, icon]) => (
                  <TabsTrigger
                    key={element}
                    value={element}
                    onClick={() => setActiveElement(element)}
                    className="flex items-center gap-1"
                  >
                    {icon}
                    <span className="hidden sm:inline">{element}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Filtrar por Raridade</div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all" onClick={() => setActiveRarity(null)}>
                  Todos
                </TabsTrigger>
                <TabsTrigger value="5" onClick={() => setActiveRarity(5)}>
                  5★
                </TabsTrigger>
                <TabsTrigger value="4" onClick={() => setActiveRarity(4)}>
                  4★
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-1">
            {filteredCharacters.map((character) => {
              const isSelected = selectedCharacters.includes(character.id)

              return (
                <div
                  key={character.id}
                  className={`p-2 border rounded-md cursor-pointer transition-all ${
                    isSelected ? "opacity-50 pointer-events-none" : "hover:border-primary"
                  }`}
                  onClick={() => !isSelected && onSelect(character)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                      {character.imagePath ? (
                        <Image
                          src={character.imagePath || "/placeholder.svg"}
                          alt={character.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        elementIcons[character.element as keyof typeof elementIcons]
                      )}
                    </div>
                    <div>
                      <div className="font-medium truncate">{character.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {character.rarity}★ | {character.element}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredCharacters.length === 0 && (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                Nenhum personagem encontrado com os filtros atuais
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ArrowLeft, PlusCircle, X } from "lucide-react"
import type { Character } from "@/types/character"
import CharacterSelector from "@/components/teams/character-selector"
import Image from "next/image"

export default function CreateTeamPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters } = useCharacters()
  const [teamName, setTeamName] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleAddCharacter = (character: Character) => {
    if (!selectedCharacters.find((c) => c.id === character.id)) {
      // Limitar a 3 personagens por time
      if (selectedCharacters.length < 3) {
        setSelectedCharacters([...selectedCharacters, character])
      }
    }
    setIsCharacterSelectorOpen(false)
  }

  const handleRemoveCharacter = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== characterId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulando criação de time
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/teams")
    } catch (error) {
      console.error("Erro ao criar time:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-6">Criar Novo Time</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Nome do Time</Label>
                <Input
                  id="teamName"
                  placeholder="Ex: Time Principal"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personagens (Máximo: 3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedCharacters.map((character) => (
                  <div key={character.id} className="relative">
                    <div className="aspect-square bg-gray-800 rounded-md overflow-hidden">
                      <div className="absolute top-0 right-0 p-1">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          type="button"
                          onClick={() => handleRemoveCharacter(character.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {character.imagePath ? (
                        <Image
                          src={character.imagePath || "/placeholder.svg"}
                          alt={character.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                          {character.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                        <div className="text-xs text-white truncate">{character.name}</div>
                        <div className="text-xs text-gray-400">
                          {character.rarity}★ | {character.element}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedCharacters.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center border-dashed"
                    onClick={() => setIsCharacterSelectorOpen(true)}
                  >
                    <PlusCircle className="h-8 w-8 mb-2" />
                    <span className="text-sm">Adicionar</span>
                  </Button>
                )}
              </div>

              {selectedCharacters.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Adicione personagens ao seu time para continuar
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total de Personagens</div>
                  <div className="text-2xl font-bold">{selectedCharacters.length}/3</div>
                </div>

                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Personagens 5★</div>
                  <div className="text-2xl font-bold">{selectedCharacters.filter((c) => c.rarity === 5).length}</div>
                </div>

                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Personagens 4★</div>
                  <div className="text-2xl font-bold">{selectedCharacters.filter((c) => c.rarity === 4).length}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || selectedCharacters.length === 0}>
                {isLoading ? "Criando..." : "Criar Time"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <CharacterSelector
          open={isCharacterSelectorOpen}
          onOpenChange={setIsCharacterSelectorOpen}
          onSelect={handleAddCharacter}
          characters={characters}
          selectedCharacters={selectedCharacters.map((c) => c.id)}
        />
      </div>
    </DashboardLayout>
  )
}

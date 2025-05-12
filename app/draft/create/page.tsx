"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { DEFAULT_DRAFT_RULES } from "@/types/draft"

export default function CreateDraftPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [draftName, setDraftName] = useState("")
  const [format, setFormat] = useState("best-of-2")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [enablePrebans, setEnablePrebans] = useState(true)

  // Configurações de pontos
  const [maxPoints, setMaxPoints] = useState(DEFAULT_DRAFT_RULES.maxPoints)
  const [pointsPerConstellation, setPointsPerConstellation] = useState(DEFAULT_DRAFT_RULES.pointsPerConstellation)
  const [pointsPerRefinement, setPointsPerRefinement] = useState(DEFAULT_DRAFT_RULES.pointsPerRefinement)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulando criação de sala
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Passar enablePrebans como parâmetro de query
      router.push(`/draft/room/123?prebans=${enablePrebans}`)
    } catch (error) {
      console.error("Erro ao criar sala:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Criar Nova Sala de Draft</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Configurações da Sala</CardTitle>
              <CardDescription>Configure os detalhes da sua sala de pick e ban</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="draftName">Nome da Sala</Label>
                <Input
                  id="draftName"
                  placeholder="Ex: Torneio Amistoso"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-of-1">Melhor de 1</SelectItem>
                    <SelectItem value="best-of-2">Melhor de 2</SelectItem>
                    <SelectItem value="best-of-3">Melhor de 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player2">Oponente (opcional)</Label>
                <Input id="player2" placeholder="Email do oponente" />
                <p className="text-sm text-muted-foreground">Deixe em branco para gerar um link de convite</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                <Label htmlFor="private">Sala Privada</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="enablePrebans" checked={enablePrebans} onCheckedChange={setEnablePrebans} />
                <Label htmlFor="enablePrebans">Ativar Pré-bans</Label>
                <p className="text-sm text-muted-foreground ml-2">
                  Permite que cada jogador bane 2 personagens antes do início do draft
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Configurações de Pontos</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="maxPoints">Pontos Máximos</Label>
                      <span>{maxPoints}</span>
                    </div>
                    <Slider
                      id="maxPoints"
                      min={1000}
                      max={2000}
                      step={100}
                      value={[maxPoints]}
                      onValueChange={(value) => setMaxPoints(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1000</span>
                      <span>2000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="pointsPerConstellation">Pontos por Constelação</Label>
                      <span>{pointsPerConstellation}</span>
                    </div>
                    <Slider
                      id="pointsPerConstellation"
                      min={50}
                      max={200}
                      step={10}
                      value={[pointsPerConstellation]}
                      onValueChange={(value) => setPointsPerConstellation(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50</span>
                      <span>200</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="pointsPerRefinement">Pontos por Refinamento</Label>
                      <span>{pointsPerRefinement}</span>
                    </div>
                    <Slider
                      id="pointsPerRefinement"
                      min={25}
                      max={100}
                      step={5}
                      value={[pointsPerRefinement]}
                      onValueChange={(value) => setPointsPerRefinement(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>25</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Sala"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

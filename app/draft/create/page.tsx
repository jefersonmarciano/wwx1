"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useDraft } from "@/hooks/use-draft"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { DEFAULT_DRAFT_RULES } from "@/types/draft"

export default function CreateDraftPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { createDraft, updateSettings } = useDraft()

  const [player1Name, setPlayer1Name] = useState("Player 1")
  const [player2Name, setPlayer2Name] = useState("Player 2")
  const [maxPoints, setMaxPoints] = useState(DEFAULT_DRAFT_RULES.maxPoints)
  const [maxPicks, setMaxPicks] = useState(6)
  const [maxBans, setMaxBans] = useState(3)
  const [pointsPerConstellation, setPointsPerConstellation] = useState(DEFAULT_DRAFT_RULES.pointsPerConstellation)
  const [pointsPerRefinement, setPointsPerRefinement] = useState(DEFAULT_DRAFT_RULES.pointsPerRefinement)
  const [useCustomRules, setUseCustomRules] = useState(false)
  const [draftType, setDraftType] = useState("tournament")

  const handleCreateDraft = () => {
    // Atualizar configurações do draft
    updateSettings({
      maxPicks,
      maxBans,
      maxPreBans: 3,
      pointLimit: maxPoints,
      constellationMultipliers: {
        1: 1.1,
        2: 1.2,
        3: 1.3,
        4: 1.4,
        5: 1.5,
      },
      refinementMultipliers: {
        1: 1.0,
        2: 1.1,
        3: 1.2,
        4: 1.3,
        5: 1.4,
      },
    })

    // Criar o draft e redirecionar para a sala
    const draftId = createDraft(player1Name, player2Name)
    router.push(`/draft/room/${draftId}`)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Criar Nova Sala de Draft</h1>

        <Tabs defaultValue="tournament" value={draftType} onValueChange={setDraftType}>
          <TabsList className="mb-6">
            <TabsTrigger value="tournament">Torneio</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="tournament">
            <Card>
              <CardHeader>
                <CardTitle>Draft de Torneio</CardTitle>
                <CardDescription>Configure uma sala de draft seguindo as regras oficiais do torneio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="player1">Seu Nome</Label>
                    <Input
                      id="player1"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player2">Nome do Oponente</Label>
                    <Input
                      id="player2"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Nome do oponente"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Picks por Jogador</Label>
                    <span className="text-sm">{maxPicks}</span>
                  </div>
                  <Slider
                    min={3}
                    max={8}
                    step={1}
                    value={[maxPicks]}
                    onValueChange={(value) => setMaxPicks(value[0])}
                    disabled={!useCustomRules}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Bans por Jogador</Label>
                    <span className="text-sm">{maxBans}</span>
                  </div>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[maxBans]}
                    onValueChange={(value) => setMaxBans(value[0])}
                    disabled={!useCustomRules}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="custom-rules" checked={useCustomRules} onCheckedChange={setUseCustomRules} />
                  <Label htmlFor="custom-rules">Usar regras personalizadas</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDraft}>Criar Sala</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Draft Personalizado</CardTitle>
                <CardDescription>Configure uma sala de draft com regras personalizadas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="custom-player1">Seu Nome</Label>
                    <Input
                      id="custom-player1"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-player2">Nome do Oponente</Label>
                    <Input
                      id="custom-player2"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Nome do oponente"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Limite de Pontos</Label>
                    <span className="text-sm">{maxPoints}</span>
                  </div>
                  <Slider
                    min={500}
                    max={3000}
                    step={100}
                    value={[maxPoints]}
                    onValueChange={(value) => setMaxPoints(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Picks por Jogador</Label>
                    <span className="text-sm">{maxPicks}</span>
                  </div>
                  <Slider
                    min={3}
                    max={8}
                    step={1}
                    value={[maxPicks]}
                    onValueChange={(value) => setMaxPicks(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Bans por Jogador</Label>
                    <span className="text-sm">{maxBans}</span>
                  </div>
                  <Slider min={0} max={5} step={1} value={[maxBans]} onValueChange={(value) => setMaxBans(value[0])} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Pontos por Constelação</Label>
                    <span className="text-sm">{pointsPerConstellation}</span>
                  </div>
                  <Slider
                    min={0}
                    max={200}
                    step={10}
                    value={[pointsPerConstellation]}
                    onValueChange={(value) => setPointsPerConstellation(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Pontos por Refinamento</Label>
                    <span className="text-sm">{pointsPerRefinement}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[pointsPerRefinement]}
                    onValueChange={(value) => setPointsPerRefinement(value[0])}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDraft}>Criar Sala</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

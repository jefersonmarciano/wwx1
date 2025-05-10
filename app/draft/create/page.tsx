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
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function CreateDraftPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [draftName, setDraftName] = useState("")
  const [format, setFormat] = useState("best-of-2")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      router.push("/draft/room/123")
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

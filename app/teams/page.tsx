"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTeams } from "@/hooks/use-teams"
import Image from "next/image"

export default function TeamsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { teams, isLoading } = useTeams()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meus Times</h1>

          <Button asChild>
            <Link href="/teams/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Novo Time
            </Link>
          </Button>
        </div>

        {teams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <PlusCircle className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Nenhum time criado</h2>
              <p className="text-muted-foreground mb-4">Crie seu primeiro time para participar de drafts e torneios</p>
              <Button asChild>
                <Link href="/teams/create">Criar Time</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {team.characters.slice(0, 3).map((character, index) => (
                      <div key={index} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative">
                        {character.imagePath ? (
                          <Image
                            src={character.imagePath || "/placeholder.svg"}
                            alt={character.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                            {character.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                          {character.name}
                        </div>
                      </div>
                    ))}
                    {team.characters.length < 3 &&
                      Array.from({ length: 3 - team.characters.length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square bg-gray-800/50 rounded-md border border-dashed border-gray-700 flex items-center justify-center"
                        >
                          <PlusCircle className="h-5 w-5 text-gray-600" />
                        </div>
                      ))}
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">
                      {team.characters.length} personagens • Custo total: {team.totalCost}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teams/${team.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

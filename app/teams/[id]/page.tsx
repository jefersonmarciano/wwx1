"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useTeams } from "@/hooks/use-teams"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2, Edit, Save } from "lucide-react"

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { teams, updateTeam, deleteTeam } = useTeams();
  const { characters } = useCharacters();
  const { weapons } = useWeapons();
  
  const [team, setTeam] = useState(teams.find(t => t.id === params.id));
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCharacters, setEditCharacters] = useState<string[]>([]);
  
  useEffect(() => {
    const foundTeam = teams.find(t => t.id === params.id);
    if (!foundTeam) {
      router.push('/teams');
      return;
    }
    
    setTeam(foundTeam);
    setEditName(foundTeam.name);
    setEditCharacters(foundTeam.characters);
  }, [teams, params.id, router]);
  
  if (!team) {
    return null;
  }
  
  const teamCharacters = characters.filter(char => 
    team.characters.includes(char.id)
  );
  
  const handleDeleteTeam = () => {
    deleteTeam(team.id);
    router.push('/teams');
    
    toast({
      title: "Deck excluído",
      description: "O deck foi removido com sucesso.",
      variant: "default"
    });
  };
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(team.name);
    setEditCharacters([...team.characters]);
  };
  
  const handleSaveEdit = () => {
    if (editName.trim() === '') {
      toast({
        title: "Nome do deck é obrigatório",
        description: "Por favor, forneça um nome para o deck.",
        variant: "destructive"
      });
      return;
    }
    
    if (editCharacters.length < 15) {
      toast({
        title: "Número mínimo de personagens não atingido",
        description: "Seu deck precisa ter pelo menos 15 personagens para torneios.",
        variant: "destructive"
      });
      return;
    }
    
    updateTeam({
      ...team,
      name: editName,
      characters: editCharacters
    });
    
    setIsEditing(false);
    
    toast({
      title: "Deck atualizado",
      description: "As alterações foram salvas com sucesso.",
      variant: "default"
    });
  };
  
  const handleSelectCharacter = (characterId: string) => {
    setEditCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/teams')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleStartEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir deck</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o deck "{team.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTeam}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              {/* Implementação das Novas Funcionalidades para o Sistema de Torneio

              Vou implementar todas as modificações solicitadas, incluindo a exibição de armas vinculadas nos times, o sistema de decks com 15 personagens, e a sala de pick/ban com 6 escolhas por jogador e 3 pré-bans. */}

\

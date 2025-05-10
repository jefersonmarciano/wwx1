"use client"

import { useState, useEffect } from "react"
import type { Character } from "@/types/character"

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // Simulando uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Dados fictícios baseados nas tabelas fornecidas, agora com imagens
        const mockCharacters: Character[] = [
          {
            id: "1",
            name: "Yinlin",
            rarity: 5,
            tier: "SS",
            element: "Eletro",
            weapon: "Retificador",
            imagePath: "/characters/yinglin.webp",
          },
          {
            id: "2",
            name: "Calcharo",
            rarity: 5,
            tier: "S",
            element: "Eletro",
            weapon: "Lâmina larga",
            imagePath: "/characters/calcharo.webp",
          },
          {
            id: "3",
            name: "Cantarella",
            rarity: 5,
            tier: "S",
            element: "Devastação",
            weapon: "Retificador",
            imagePath: "/characters/cantarela.webp",
          },
          {
            id: "4",
            name: "Changli",
            rarity: 5,
            tier: "S",
            element: "Fusão",
            weapon: "Espada",
            imagePath: "/characters/changli.webp",
          },
          {
            id: "5",
            name: "Rocha",
            rarity: 5,
            tier: "S",
            element: "Devastação",
            weapon: "Manopla",
            imagePath: "/characters/roccia.webp",
          },
          {
            id: "6",
            name: "Zhezhi",
            rarity: 5,
            tier: "SS",
            element: "Glacio",
            weapon: "Retificador",
            imagePath: "/characters/zhe.webp",
          },
          {
            id: "7",
            name: "Verina",
            rarity: 5,
            tier: "S",
            element: "Espectro",
            weapon: "Retificador",
            imagePath: "/characters/verina.webp",
          },
          {
            id: "8",
            name: "Sanhua",
            rarity: 4,
            tier: "S",
            element: "Glacio",
            weapon: "Espada",
            imagePath: "/characters/senhua.webp",
          },
          {
            id: "9",
            name: "Jiyan",
            rarity: 5,
            tier: "S",
            element: "Aero",
            weapon: "Lâmina larga",
            imagePath: "/characters/jiyan.webp",
          },
          {
            id: "10",
            name: "Guarda costeiro",
            rarity: 5,
            tier: "SS",
            element: "Espectro",
            weapon: "Retificador",
            imagePath: "/characters/keeper.webp",
          },
          // Personagens já adicionados previamente
          {
            id: "11",
            name: "Camélia",
            rarity: 5,
            tier: "SS",
            element: "Devastação",
            weapon: "Espada",
            imagePath: "/characters/camelia.webp",
          },
          {
            id: "12",
            name: "Xiangli Yao",
            rarity: 5,
            tier: "SS",
            element: "Eletro",
            weapon: "Manopla",
            imagePath: "/characters/xiangli.webp",
          },
          {
            id: "13",
            name: "Rover",
            rarity: 5,
            tier: "S",
            element: "Devastação",
            weapon: "Espada",
            imagePath: "/characters/rover.webp",
          },
          {
            id: "14",
            name: "Encore",
            rarity: 4,
            tier: "S",
            element: "Devastação",
            weapon: "Manopla",
            imagePath: "/characters/encore.webp",
          },
          {
            id: "15",
            name: "Brant",
            rarity: 5,
            tier: "S",
            element: "Fusão",
            weapon: "Espada",
            imagePath: "/characters/brant.webp",
          },
          {
            id: "16",
            name: "Jinhsi",
            rarity: 5,
            tier: "SS",
            element: "Espectro",
            weapon: "Lâmina larga",
            imagePath: "/characters/jinhsi.webp",
          },
          {
            id: "17",
            name: "Zani",
            rarity: 5,
            tier: "SS",
            element: "Espectro",
            weapon: "Manopla",
            imagePath: "/characters/zani.webp",
          },
          {
            id: "18",
            name: "Febe",
            rarity: 5,
            tier: "SS",
            element: "Espectro",
            weapon: "Retificador",
            imagePath: "/characters/febe.webp",
          },
          {
            id: "19",
            name: "Carlota",
            rarity: 5,
            tier: "SS",
            element: "Glacio",
            weapon: "Pistola",
            imagePath: "/characters/carlota.webp",
          },
          // Novos personagens adicionados agora
          {
            id: "20",
            name: "Youhu",
            rarity: 4,
            tier: "UM",
            element: "Glacio",
            weapon: "Manopla",
            imagePath: "/characters/youhu.webp",
          },
          {
            id: "21",
            name: "Jianxin",
            rarity: 5,
            tier: "UM",
            element: "Aero",
            weapon: "Manopla",
            imagePath: "/characters/jianxin.webp",
          },
          {
            id: "22",
            name: "Yuan Wu",
            rarity: 4,
            tier: "UM",
            element: "Eletro",
            weapon: "Manopla",
            imagePath: "/characters/yuanwu.webp",
          },
          {
            id: "23",
            name: "Yangyang",
            rarity: 4,
            tier: "B",
            element: "Aero",
            weapon: "Espada",
            imagePath: "/characters/yangyang.webp",
          },
          {
            id: "24",
            name: "Baizhi",
            rarity: 4,
            tier: "UM",
            element: "Glacio",
            weapon: "Retificador",
            imagePath: "/characters/baizhi.webp",
          },
          {
            id: "25",
            name: "Lumi",
            rarity: 4,
            tier: "UM",
            element: "Eletro",
            weapon: "Lâmina larga",
            imagePath: "/characters/lumi.webp",
          },
          {
            id: "26",
            name: "Aalto",
            rarity: 4,
            tier: "UM",
            element: "Aero",
            weapon: "Pistola",
            imagePath: "/characters/aalto.webp",
          },
          {
            id: "27",
            name: "Chixia",
            rarity: 4,
            tier: "B",
            element: "Fusão",
            weapon: "Pistola",
            imagePath: "/characters/chixia.webp",
          },
          // Personagens restantes
          { id: "28", name: "Lingyang", rarity: 5, tier: "B", element: "Glacio", weapon: "Manopla" },
          { id: "29", name: "Rover (Aero)", rarity: 5, tier: "B", element: "Aero", weapon: "Espada" },
          { id: "30", name: "Rover (Spectro)", rarity: 5, tier: "UM", element: "Espectro", weapon: "Espada" },
          { id: "31", name: "Danjin", rarity: 4, tier: "S", element: "Devastação", weapon: "Espada" },
          { id: "32", name: "Mortefi", rarity: 4, tier: "S", element: "Fusão", weapon: "Pistola" },
          { id: "33", name: "Tao Qi", rarity: 4, tier: "B", element: "Devastação", weapon: "Lâmina larga" },
          { id: "34", name: "Bis", rarity: 5, tier: "S", element: "Fusão", weapon: "Retificador" },
        ]

        setCharacters(mockCharacters)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  return { characters, isLoading, error }
}

"use client"

import type { Character } from "@/types/character"

interface DraftTeamsProps {
  team1Picks: (Character | null)[]
  team2Picks: (Character | null)[]
}

export default function DraftTeams({ team1Picks, team2Picks }: DraftTeamsProps) {
  const renderTeamGrid = (team: (Character | null)[]) => {
    return (
      <div className="grid grid-cols-4 gap-2">
        {team.map((character, index) => (
          <div
            key={index}
            className={`rounded-md overflow-hidden ${
              character ? (index % 2 === 0 ? "border-red-500" : "border-blue-500") : "border-gray-700"
            } border`}
          >
            {character ? (
              <div className="aspect-square bg-gray-700 relative">
                <div className="absolute top-0 left-0 w-full p-1 flex justify-between items-center">
                  <div className="text-xs font-bold">{character.rarity}★</div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-1 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-xs font-medium truncate">{character.name}</div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-700 flex items-center justify-center text-gray-500">
                {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-center">Time 1</h3>
        {renderTeamGrid(team1Picks)}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-center">Time 2</h3>
        {renderTeamGrid(team2Picks)}
      </div>
    </div>
  )
}

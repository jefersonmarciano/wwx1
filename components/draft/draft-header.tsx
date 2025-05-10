"use client"

import { useEffect, useState } from "react"

interface DraftHeaderProps {
  player1: string
  player2: string
  player1Costs: {
    agent: number
    engine: number
  }
  player2Costs: {
    agent: number
    engine: number
  }
  timer: {
    minutes: number
    seconds: number
  }
  currentPhase: string
}

export default function DraftHeader({
  player1,
  player2,
  player1Costs,
  player2Costs,
  timer,
  currentPhase,
}: DraftHeaderProps) {
  const [time, setTime] = useState({ minutes: timer.minutes, seconds: timer.seconds })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime.seconds === 0) {
          if (prevTime.minutes === 0) {
            clearInterval(interval)
            return prevTime
          }
          return { minutes: prevTime.minutes - 1, seconds: 59 }
        }
        return { ...prevTime, seconds: prevTime.seconds - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-black border-b border-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <div className="text-xl font-bold text-white">{player1}</div>
          <div className="text-sm text-gray-400">Agent costs: {player1Costs.agent}</div>
          <div className="text-sm text-gray-400">Engine costs: {player1Costs.engine}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-white">
            {String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-gray-400 mt-1">{currentPhase}</div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xl font-bold text-white">{player2}</div>
          <div className="text-sm text-gray-400">Agent costs: {player2Costs.agent}</div>
          <div className="text-sm text-gray-400">Engine costs: {player2Costs.engine}</div>
        </div>
      </div>
    </div>
  )
}

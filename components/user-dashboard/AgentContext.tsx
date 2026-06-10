"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Agent = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

interface AgentContextType {
  agents: Agent[]
  selectedAgent: Agent | null
  setSelectedAgent: (agent: Agent | null) => void
  isLoading: boolean
  refreshAgents: () => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents")
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
        
        // Always ensure an agent is selected if available
        if (data.length > 0) {
          // If we already have one selected, try to find it in the new list to keep reference fresh
          if (selectedAgent) {
            const found = data.find((a: Agent) => a.id === selectedAgent.id)
            if (found) {
              setSelectedAgent(found)
            } else {
              setSelectedAgent(data[0])
            }
          } else {
            setSelectedAgent(data[0])
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch agents", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return (
    <AgentContext.Provider
      value={{
        agents,
        selectedAgent,
        setSelectedAgent,
        isLoading,
        refreshAgents: fetchAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider")
  }
  return context
}

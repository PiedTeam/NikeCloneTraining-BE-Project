const developerAgents = ['Chrome', 'Firefox', 'Safari', 'Edge']

export function isDeveloperAgent(userAgent: string): boolean {
    for (const agent of developerAgents) {
        if (userAgent.includes(agent)) {
            return true
        }
    }
    return false
}

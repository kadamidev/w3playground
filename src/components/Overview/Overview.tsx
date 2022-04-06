import React, { useEffect, useState } from "react"
import {
  Text,
  Badge,
  Paper,
  Title,
  ActionIcon,
  useMantineTheme,
  Transition,
} from "@mantine/core"
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers"
import { ethers } from "ethers"
import { FiRefreshCw } from "react-icons/fi"

interface Props {
  address: string
  provider: Web3Provider | null
  jsonRpcProvider: JsonRpcProvider | null
}

const Overview: React.FC<Props> = ({ address, provider, jsonRpcProvider }) => {
  const [balance, setBalance] = useState("0.0")
  const [refreshing, setRefreshing] = useState(false)
  const [opened, setOpened] = useState(false)

  const theme = useMantineTheme()

  useEffect(() => {
    setOpened(true)
  }, [])

  useEffect(() => {
    getBal()
  }, [address])

  async function getBal() {
    setRefreshing(true)
    const bal = await jsonRpcProvider?.getBalance(address)
    if (bal) {
      const balSplit = ethers.utils.formatUnits(bal, 18).split(".")
      balSplit[1] = balSplit[1].substring(0, 6)

      setBalance(balSplit.join("."))
      setRefreshing(false)
    }
  }

  return (
    <Transition
      mounted={opened}
      transition="slide-right"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <div style={styles}>
          <Paper
            shadow="sm"
            p="xl"
            withBorder
            sx={(theme) => ({
              position: "relative",
              [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                maxWidth: "500px",
              },
            })}
          >
            <Title order={2}>Overview</Title>
            <Badge mt="md" color={address !== "" ? "" : "orange"}>
              {address !== "" ? address : "awaiting connection"}
            </Badge>
            <Text size="lg" mt="xs">
              Balance: <strong>{balance}</strong>
            </Text>
            <ActionIcon
              color="sandboxGreen"
              variant="outline"
              sx={{ position: "absolute", right: "10px", top: "10px" }}
              disabled={refreshing ? true : false}
              loading={refreshing ? true : false}
              onClick={getBal}
            >
              <FiRefreshCw />
            </ActionIcon>
          </Paper>
        </div>
      )}
    </Transition>
  )
}

export default Overview

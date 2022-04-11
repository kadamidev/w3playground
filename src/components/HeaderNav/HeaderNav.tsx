import React, { useState } from "react"

import {
  Burger,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
  Button,
  MantineTheme,
} from "@mantine/core"

interface Props {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  address: string
  connectWallet(): Promise<void>
}

const HeaderNav: React.FC<Props> = ({
  opened,
  setOpened,
  address,
  connectWallet,
}) => {
  const theme: MantineTheme = useMantineTheme()

  function formatAddress(address: string) {
    const start = address.slice(0, 4)
    const end = address.slice(-4)

    return `${start}...${end}`
  }

  const gradientConnect = { from: "orange", to: "red" }
  const gradientConnected = { from: "teal", to: "lime" }
  return (
    <div>
      <Header height={70} p="md">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>

          <Text
            size="xl"
            weight={700}
            variant="gradient"
            gradient={{ from: "sandboxGreen", to: "lime", deg: 45 }}
            style={{ fontFamily: "Poppins", userSelect: "none" }}
          >
            w3Playground
          </Text>
          <div style={{ width: "115px" }}>
            <Button
              fullWidth
              variant="gradient"
              gradient={address !== "" ? gradientConnected : gradientConnect}
              style={{
                fontSize: "12",
                padding: "0",
              }}
              onClick={connectWallet}
            >
              {address !== "" ? formatAddress(address) : "Connect"}
            </Button>
          </div>
        </div>
      </Header>
    </div>
  )
}

export default HeaderNav

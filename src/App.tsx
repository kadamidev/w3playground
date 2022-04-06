import React, { useState } from "react"
import "./App.css"
import {
  AppShell,
  MantineThemeOverride,
  MantineProvider,
  ColorScheme,
} from "@mantine/core"
import { NotificationsProvider, showNotification } from "@mantine/notifications"
import { ethers } from "ethers"
import HeaderNav from "./components/HeaderNav/HeaderNav"
import SideNav from "./components/SideNav/SideNav"
import Overview from "./components/Overview/Overview"
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers"
import { GiFox } from "react-icons/gi"
import { FaCheck } from "react-icons/fa"
import Send from "./components/Send/Send"

export enum Applets {
  OVERVIEW,
  SEND,
}

function App() {
  const [opened, setOpened] = useState(false)
  const [ethersProvider, setEthersProvider] = useState<Web3Provider | null>(
    null
  )
  const [jsonRpcProvider, setJsonRpcProvider] =
    useState<JsonRpcProvider | null>(null)
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(
    null
  )

  const [address, setAddress] = useState<string>("")
  const [darkMode, setDarkMode] = useState<ColorScheme>("dark")
  const [activeApplet, setActiveApplet] = useState<Applets>(Applets.OVERVIEW)

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const jsonRpcProvider = new ethers.providers.JsonRpcProvider()
      setEthersProvider(provider)
      setSigner(signer)
      setJsonRpcProvider(jsonRpcProvider)

      const addresses = await provider.send("eth_requestAccounts", [])
      setAddress(addresses[0])
      showNotification({
        title: "Successfully Connected",
        message: `${addresses[0]}`,
        color: "sandboxGreen",
        icon: <FaCheck />,
      })
    } else {
      showNotification({
        title: "No MetaMask Detected",
        message: "Install MetaMask interact with this website",
        color: "orange",
        icon: <GiFox />,
      })
    }
  }

  const sandboxGreenTheme: MantineThemeOverride = {
    colorScheme: darkMode,
    colors: {
      sandboxGreen: [
        "#F1F8EF",
        "#DBF1D6",
        "#B5F2A7",
        "#9BF087",
        "#86E96D",
        "#68E349",
        "#56C23B",
        "#57B640",
        "#36B517",
        "#24AC02",
      ],
      dark: [
        "#ffffff",
        "#A6A7AA",
        "#909296",
        "#5C5F65",
        "#3A6331",
        "#224E18",
        "#202320",
        "#1A1D19",
        "#08200F",
        "#051208",
      ],
    },
    primaryColor: "sandboxGreen",
    loader: "bars",
  }

  function renderApplet() {
    switch (activeApplet) {
      case Applets.OVERVIEW:
        return (
          <Overview
            address={address}
            provider={ethersProvider}
            jsonRpcProvider={jsonRpcProvider}
          />
        )
      case Applets.SEND:
        return (
          <Send
            address={address}
            provider={ethersProvider}
            jsonRpcProvider={jsonRpcProvider}
            signer={signer}
          />
        )
    }
  }

  return (
    <MantineProvider
      theme={sandboxGreenTheme}
      styles={{
        Paper: (theme) => ({
          root: {
            backgroundColor:
              darkMode === "dark" ? theme.colors.dark[6] : theme.colors.dark[0],
            borderColor:
              darkMode === "dark"
                ? theme.colors.dark[5]
                : theme.colors.sandboxGreen[1],
          },
        }),
        TextInput: (theme) => ({
          filledVariant: {
            backgroundColor: darkMode === "dark" ? theme.colors.dark[7] : "",
          },
        }),
      }}
      withGlobalStyles
    >
      <NotificationsProvider>
        <AppShell
          navbarOffsetBreakpoint="sm"
          fixed
          navbar={
            <SideNav
              opened={opened}
              setOpened={setOpened}
              setDarkMode={setDarkMode}
              darkMode={darkMode}
              activeApplet={activeApplet}
              setActiveApplet={setActiveApplet}
            />
          }
          header={
            <HeaderNav
              address={address}
              connectWallet={connectWallet}
              opened={opened}
              setOpened={setOpened}
            />
          }
        >
          {renderApplet()}
        </AppShell>
      </NotificationsProvider>
    </MantineProvider>
  )
}

export default App

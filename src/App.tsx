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
import { ExternalProvider, Web3Provider } from "@ethersproject/providers"
import { GiFox } from "react-icons/gi"
import { FaCheck } from "react-icons/fa"
import Send from "./components/Send/Send"
import MintNFT from "./components/MintNFT/MintNFT"
import { BiNetworkChart } from "react-icons/bi"

export enum Applets {
  OVERVIEW,
  SEND,
  MINT_NFT,
}

interface MonkeyProvider extends ExternalProvider {
  on?: Web3Provider["on"]
  removeAllListeners?: Web3Provider["removeAllListeners"]
}

function App() {
  const [opened, setOpened] = useState(false)
  const [ethersProvider, setEthersProvider] = useState<Web3Provider | null>(
    null
  )
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(
    null
  )
  const [address, setAddress] = useState<string>("")
  const [darkMode, setDarkMode] = useState<ColorScheme>("dark")
  const [activeApplet, setActiveApplet] = useState<Applets>(Applets.OVERVIEW)

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
      const signer = provider.getSigner()
      setEthersProvider(provider)
      setSigner(signer)
      const wrappedProv: MonkeyProvider = provider.provider

      provider.removeAllListeners()
      wrappedProv.removeAllListeners!()

      wrappedProv.on!("accountsChanged", () => {
        connectWallet()
      })
      // provider.on("network", (newNetwork, oldNetwork) => {
      //   console.log("hi")
      // })

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

  function checkConnection() {
    if (typeof window.ethereum !== "undefined" && address) return true
    showNotification({
      title: "Awaiting connection",
      message: "Connect your MetaMask to be able to interact with the app.",
      color: "orange",
      icon: <GiFox />,
    })
    return false
  }

  async function getChain() {
    const network = await ethersProvider?.getNetwork()
    const testnets = [3, 4, 42, 5, 1337]

    if (network && testnets.includes(network.chainId)) {
      return true
    } else {
      showNotification({
        title: "Unsupported Network",
        autoClose: 10000,
        message:
          "This app only supports testnets, please switch your MetaMask to a test network RPC or to your own local testing environment using network ID 1337",
        color: "red",
        icon: <BiNetworkChart />,
      })
      return false
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
        "#282928",
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
            checkConnection={checkConnection}
          />
        )
      case Applets.SEND:
        return (
          <Send
            address={address}
            provider={ethersProvider}
            signer={signer}
            getChain={getChain}
            checkConnection={checkConnection}
          />
        )
      case Applets.MINT_NFT:
        return (
          <MintNFT
            address={address}
            provider={ethersProvider}
            signer={signer}
            getChain={getChain}
            checkConnection={checkConnection}
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
        NumberInput: (theme) => ({
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

import React from "react"
import {
  Navbar,
  Text,
  useMantineTheme,
  Button,
  ColorScheme,
  ThemeIcon,
  ActionIcon,
  Badge,
} from "@mantine/core"
import { IoWalletOutline } from "react-icons/io5"
import { MdSend } from "react-icons/md"
import { WiSunrise } from "react-icons/wi"
import { BsMoonStars } from "react-icons/bs"
import "./SideNav.css"
import { Applets } from "../../App"
import { GiFairyWand } from "react-icons/gi"

interface Props {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  setDarkMode: React.Dispatch<React.SetStateAction<ColorScheme>>
  darkMode: ColorScheme
  activeApplet: Applets
  setActiveApplet: React.Dispatch<React.SetStateAction<Applets>>
}

const SideNav: React.FC<Props> = ({
  activeApplet,
  setActiveApplet,
  opened,
  setOpened,
  darkMode,
  setDarkMode,
}) => {
  const theme = useMantineTheme()

  function handleAppletSwitch(applet: Applets) {
    setActiveApplet(applet)
    setOpened(false)
  }

  return (
    <div>
      <Navbar
        p="xs"
        // Breakpoint at which navbar will be hidden if hidden prop is true
        hiddenBreakpoint="sm"
        // Hides navbar when viewport size is less than value specified in hiddenBreakpoint
        hidden={!opened}
        // when viewport size is less than theme.breakpoints.sm navbar width is 100%
        // viewport size > theme.breakpoints.sm – width is 300px
        // viewport size > theme.breakpoints.lg – width is 400px
        width={{ sm: 200, lg: 300 }}
        // width={{ sm: 300, lg: 400 }}
        className={opened ? "navBarContainer" : ""}
        sx={{ justifyContent: "space-between" }}
      >
        <div className="navItems">
          <Button
            variant="subtle"
            size="xl"
            onClick={() => handleAppletSwitch(Applets.OVERVIEW)}
          >
            <ThemeIcon
              size="lg"
              variant="gradient"
              gradient={{ from: "sandboxGreen", to: "lime" }}
              className="icons"
            >
              <IoWalletOutline />
            </ThemeIcon>
            Overview
          </Button>
          <Button
            variant="subtle"
            color={theme.primaryColor}
            size="xl"
            onClick={() => handleAppletSwitch(Applets.SEND)}
          >
            <ThemeIcon
              size="lg"
              variant="gradient"
              gradient={{ from: "sandboxGreen", to: "lime" }}
              className="icons"
            >
              <MdSend />
            </ThemeIcon>
            Send
          </Button>
          <Button
            variant="subtle"
            color={theme.primaryColor}
            size="xl"
            onClick={() => handleAppletSwitch(Applets.MINT_NFT)}
            disabled
            className="btnDisable"
            // sx={{ ":disabled": { backgroundColor: "green" } }}
          >
            <ThemeIcon
              size="lg"
              variant="gradient"
              gradient={{ from: "sandboxGreen", to: "lime" }}
              className="icons"
            >
              <GiFairyWand />
            </ThemeIcon>
            Mint NFT
            <Badge
              ml="5px"
              variant="gradient"
              gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
              radius="xs"
              size="xs"
              sx={{ cursor: "not-allowed" }}
            >
              WIP
            </Badge>
          </Button>
        </div>
        <div className="navBottom">
          <ActionIcon
            variant="outline"
            size={"lg"}
            onClick={() =>
              darkMode === "dark" ? setDarkMode("light") : setDarkMode("dark")
            }
          >
            {darkMode === "dark" ? (
              <WiSunrise size="19.5px" />
            ) : (
              <BsMoonStars />
            )}
          </ActionIcon>
        </div>
      </Navbar>
    </div>
  )
}

export default SideNav

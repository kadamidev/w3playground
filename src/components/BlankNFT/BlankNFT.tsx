import React from "react"
import { Text, Paper, useMantineTheme, Box } from "@mantine/core"
import "./BlankNFT.css"

const BlankNFT = () => {
  const theme = useMantineTheme()

  return (
    <Paper
      mt="sm"
      shadow="sm"
      sx={{
        [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
          width: "300px",
          height: "300px",
        },
        width: "200px",
        height: "200px",
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.sandboxGreen[0],
      }}
      radius="md"
    >
      <Box
        className="blankNftContainer"
        sx={{
          [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
            width: "300px",
            height: "300px",
          },
          width: "200px",
          height: "200px",
        }}
      >
        <Text
          sx={{
            fontSize: "120px",
            [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
              fontSize: "200px",
            },
          }}
          className="spinningQ"
        >
          ?
        </Text>
      </Box>
    </Paper>
  )
}

export default BlankNFT

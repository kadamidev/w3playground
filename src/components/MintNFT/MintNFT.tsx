import React, { useEffect, useState } from "react"
import {
  Text,
  Badge,
  Paper,
  Title,
  useMantineTheme,
  TextInput,
  Group,
  Button,
  Loader,
  Box,
  Table,
  Accordion,
  Transition,
  Alert,
  NumberInput,
  Slider,
} from "@mantine/core"
import { useForm, yupResolver } from "@mantine/form"
import { Web3Provider } from "@ethersproject/providers"
import { ethers, BigNumber } from "ethers"
import * as yup from "yup"
import { FaCheck } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { showNotification } from "@mantine/notifications"
import { useClipboard } from "@mantine/hooks"
import { contractHash } from "../../test_contracts/testParams"
import dogesAbi from "./dogesAbi.json"
import { GiBalloonDog } from "react-icons/gi"
import BlankNFT from "../BlankNFT/BlankNFT"

interface Props {
  address: string
  provider: Web3Provider | null
  signer: ethers.providers.JsonRpcSigner | null
  getChain: () => Promise<boolean>
  checkConnection: () => boolean
}

const MintNFT: React.FC<Props> = ({
  address,
  provider,
  signer,
  getChain,
  checkConnection,
}) => {
  const [balance, setBalance] = useState<number>(0.0)
  const [loading, setLoading] = useState(false)
  const theme = useMantineTheme()
  const [feedback, setFeedback] = useState<string>("")
  const [lastHashes, setLastHashes] = useState<{ hash: string }[]>([])
  const [opened, setOpened] = useState(false)
  const [currentMint, setCurrentMint] = useState<string[]>([])
  const [quantity, setQuantity] = useState(3)

  useEffect(() => {
    setOpened(true)
  }, [])

  const clipboard = useClipboard({ timeout: 500 })

  useEffect(() => {
    getBal()
  }, [address])

  async function handleMint() {
    setLoading(true)
    const qty = quantity.valueOf()
    if (window.ethereum && checkConnection() && signer) {
      const contract = new ethers.Contract(contractHash, dogesAbi.abi, signer)

      try {
        const beforeBal = Number(await contract.balanceOf(address))
        const res = await contract.mint(BigNumber.from(qty))
        console.log(res)

        if (await res.wait(1)) {
          const tokenId = Number(
            await contract.tokenOfOwnerByIndex(address, beforeBal)
          )

          const minted = []
          for (let i = 0; i < Number(qty); i++) {
            const uri = await contract.tokenURI(BigNumber.from(tokenId + i))
            minted.push(uri)
          }

          setCurrentMint(minted)
        }

        // console.log(res)
        setLoading(false)
        // setFeedback("success")
        showNotification({
          title: "Successfully Minted",
          message: `Successfully minted ${qty} NFT${qty > 1 ? "'s" : ""}`,
          color: "sandboxGreen",
          icon: <FaCheck />,
        })
      } catch (e: any) {
        // setFeedback("failed")
        setLoading(false)
        showNotification({
          title: "Failed sending",
          message: `${e.message}`,
          color: "red",
          icon: <IoMdClose />,
        })
      }
    }
  }

  async function getBal() {
    const bal = await provider?.getBalance(address)
    if (bal) {
      const balSplit = ethers.utils.formatUnits(bal, 18).split(".")
      balSplit[1] = balSplit[1].substring(0, 10)

      setBalance(parseFloat(balSplit.join(".")))
    }
  }

  const amounts = [
    { value: 1, label: "1 DOGE" },
    { value: 2, label: "2 DOGES" },
    { value: 3, label: "3 DOGES" },
    { value: 4, label: "4 DOGES" },
    { value: 5, label: "5 DOGES" },
  ]

  return (
    <Transition
      mounted={opened}
      transition="slide-right"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <div className="container" style={styles}>
          <Paper
            shadow="sm"
            p="xl"
            withBorder
            sx={(theme) => ({
              position: "relative",
              [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                maxWidth: "600px",
              },
            })}
          >
            <Title order={2}>Mint NFT</Title>
            <Badge
              mt="md"
              color={address !== "" ? "" : "orange"}
              style={
                address !== "" ? { cursor: "pointer" } : { cursor: "default" }
              }
              sx={
                clipboard.copied
                  ? {
                      color: "transparent",
                      "&:before": {
                        content: `"Copied"`,
                        color:
                          theme.colorScheme === "dark"
                            ? theme.colors.sandboxGreen[2]
                            : theme.colors.sandboxGreen[6],
                        position: "absolute",
                      },
                    }
                  : {}
              }
              onClick={() => {
                if (address !== "") clipboard.copy(address)
              }}
            >
              {address !== "" ? address : "awaiting connection"}
            </Badge>

            <Alert
              mt="md"
              icon={<GiBalloonDog size={"20px"} />}
              title="Rinkeby Doges"
              variant="light"
              radius="md"
              sx={(theme) => ({
                color: theme.colors.sandboxGreen[5],
                backgroundColor:
                  theme.colorScheme === "dark" ? theme.colors.dark[4] : "",
              })}
            >
              Rinkeby Doges are magnificent pieces of art only available on the
              Rinkeby Testnet, switch your network to Rinkeby Test Network if
              you wish to mint them. There's an infinite supply of them
              available, however you may only mint 5 at a time.
            </Alert>
            <form>
              <Text size="sm" mt="md">
                Available: Unlimited
              </Text>
              <Text size="sm">Mint Price: FREE</Text>
              {/* <Box mt="xl" sx={{ width: "90%", display: "flex" }}> */}

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <BlankNFT />
              </Box>
              <Text size="xs" mt="xl">
                Qty
              </Text>
              <Slider
                size="lg"
                label={(val) =>
                  amounts.find((mark) => mark.value === val)?.label
                }
                defaultValue={quantity}
                min={1}
                max={5}
                marks={amounts}
                styles={{
                  markLabel: { display: "none" },
                  label: {
                    backgroundColor: theme.colors.sandboxGreen[5],
                    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.25)",
                  },
                }}
                onChangeEnd={(v) => setQuantity(v)}
                labelAlwaysOn
                sx={{ minWidth: "100%" }}
              />
              {/* </Box> */}

              <Group position="apart" mt="md">
                <Box>
                  {loading && <Loader className="loader" />}
                  {/* {feedback && <Text>{feedback}</Text>} */}
                </Box>

                <Button
                  onClick={handleMint}
                  variant="outline"
                  disabled={loading}
                >
                  Mint
                </Button>
              </Group>
            </form>
          </Paper>
        </div>
      )}
    </Transition>
  )
}

export default MintNFT

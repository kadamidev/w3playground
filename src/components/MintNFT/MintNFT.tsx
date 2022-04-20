import React, { useEffect, useState, useRef } from "react"
import {
  Text,
  Badge,
  Paper,
  Title,
  useMantineTheme,
  Group,
  Button,
  Loader,
  Box,
  Transition,
  Alert,
  Slider,
  LoadingOverlay,
  keyframes,
} from "@mantine/core"
import { Web3Provider } from "@ethersproject/providers"
import { ethers, BigNumber } from "ethers"
import { FaCheck } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { showNotification } from "@mantine/notifications"
import { useClipboard } from "@mantine/hooks"
import dogesAbi from "./dogesAbi.json"
import { GiBalloonDog } from "react-icons/gi"
import BlankNFT from "../BlankNFT/BlankNFT"
import SliderNFT from "../SliderNFT/SliderNFT"
import Confetti from "react-confetti"
import { BiNetworkChart } from "react-icons/bi"

interface Props {
  address: string
  provider: Web3Provider | null
  signer: ethers.providers.JsonRpcSigner | null
  getChain: () => Promise<boolean>
  checkConnection: () => boolean
  vWidth: number
  sHeight: number
}

export interface CurrentMintI {
  uri: string
  seen: boolean
  tokenId: string
  loaded: boolean
}

const contractHash = "0x4cd46e623aaaD7B396511A9Da9D61eBEd63fc94e"

const MintNFT: React.FC<Props> = ({
  address,
  provider,
  signer,
  getChain,
  checkConnection,
  vWidth,
  sHeight,
}) => {
  const [loading, setLoading] = useState(false)
  const theme = useMantineTheme()
  // const [feedback, setFeedback] = useState<string>("")
  const [opened, setOpened] = useState(false)
  const [currentMint, setCurrentMint] = useState<CurrentMintI[]>([])
  const [quantity, setQuantity] = useState(3)
  const [confettiCoords, setConfettiCoords] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  const [runConfetti, setRunConfetti] = useState<boolean>(false)
  const [initialRun, setInitialRun] = useState<boolean>(false)
  const [showSlider, setShowSlider] = useState<boolean>(false)
  const [firstLoaded, setFirstLoaded] = useState<boolean>(false)
  const [timedOut, setTimedOut] = useState<boolean>(false)
  const [loadingStatus, setLoadingStatus] = useState<string>("breeding")

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const firstImageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setOpened(true)
  }, [])

  console.log("loaded: ", firstLoaded)

  const clipboard = useClipboard({ timeout: 500 })

  async function handleMint() {
    const qty = quantity.valueOf()
    if (checkConnection() && window.ethereum && signer) {
      if ((await provider!.getNetwork()).chainId !== 4) {
        showNotification({
          title: "Unsupported Network",
          autoClose: 10000,
          message:
            "Rinkeby Doges is only available on the Rinkeby Test Network.",
          color: "red",
          icon: <BiNetworkChart />,
        })
        return
      }

      setCurrentMint([])
      if (showSlider) {
        console.log("showslider set to false in handleMint")
        setShowSlider(false)
      }
      setLoadingStatus("breeding")
      setLoading(true)
      const contract = new ethers.Contract(contractHash, dogesAbi.abi, signer)

      try {
        const beforeBal = Number(await contract.balanceOf(address))
        const res = await contract.mint(BigNumber.from(qty))

        if (await res.wait(1)) {
          const tokenId = Number(
            await contract.tokenOfOwnerByIndex(address, beforeBal)
          )

          const minted = []
          for (let i = 0; i < Number(qty); i++) {
            const uri = await contract.tokenURI(BigNumber.from(tokenId + i))
            minted.push({
              uri: uri,
              seen: i === 0 ? true : false,
              tokenId: (tokenId + i).toString(),
              loaded: false,
            })
          }
          setCurrentMint(minted)
        }

        setLoadingStatus("retrieving doges from the IPFS")
        const loadTimer = setTimeout(() => {
          setTimedOut(true)
        }, 120000)
        timerRef.current = loadTimer
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
          title: "Failed minting",
          message: `${e.message}`,
          color: "red",
          icon: <IoMdClose />,
        })
      }
    }
  }
  //finish mint
  useEffect(() => {
    if (timedOut) {
      setLoading(false)
      showNotification({
        title: "Failed retrieving from IPFS",
        message: `Failed retrieving some assets from the IPFS, your experience may be affected.`,
        color: "red",
        icon: <IoMdClose />,
      })
      setShowSlider(true)
      setTimedOut(false)
    }
    if (firstLoaded) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      currentMint.map((item, idx) =>
        idx === 0 ? { ...item, seen: true } : item
      )
      setShowSlider(true)
      setTimeout(() => trigger(), 100)
      setLoading(false)

      setFirstLoaded(false)
    }
  }, [firstLoaded, timedOut])

  const amounts = [
    { value: 1, label: "1 DOGE" },
    { value: 2, label: "2 DOGES" },
    { value: 3, label: "3 DOGES" },
    { value: 4, label: "4 DOGES" },
    { value: 5, label: "5 DOGES" },
  ]

  async function trigger() {
    if (sliderRef.current) {
      const coords = sliderRef.current?.getBoundingClientRect()
      setConfettiCoords({
        x: coords.x + coords.width / 2 - 100,
        y: coords.y + coords.height / 2,
      })
    }
    setInitialRun(true)
    setRunConfetti(true)
    setTimeout(() => setRunConfetti(false), 1000)
  }

  const dotsLoader = keyframes({
    "0%": { content: `"${loadingStatus}"` },
    "33%": { content: `"${loadingStatus}."` },
    "66%": { content: `"${loadingStatus}.."` },
    "100%": { content: `"${loadingStatus}..."` },
  })

  return (
    <>
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
              <LoadingOverlay
                visible={loading}
                loaderProps={{ size: "xl" }}
                overlayColor={
                  theme.colorScheme === "dark" ? theme.colors.dark[9] : ""
                }
                overlayOpacity={0.8}
                sx={{
                  backdropFilter: "blur(3px)",
                  "&:before": {
                    content: `"${loadingStatus}"`,
                    color: "white",
                    opacity: "1",
                    zIndex: "10000",
                    position: "absolute",
                    top: "calc(50% + 30px)",
                    animation: `${dotsLoader} 1s ease-in-out infinite`,
                  },
                }}
              />
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
                Rinkeby Doges are magnificent pieces of art only available on
                the Rinkeby Testnet, switch your network to Rinkeby Test Network
                if you wish to mint them. There's an infinite supply of them
                available, however you may only mint 5 at a time.
              </Alert>
              <form>
                <Text size="sm" mt="md">
                  Available: Unlimited
                </Text>
                <Text size="sm">Mint Price: FREE</Text>

                <Box
                  mt="sm"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
                      height: "300px",
                    },
                    height: "220px",
                  }}
                >
                  {!showSlider && <BlankNFT />}
                  <Paper shadow="sm" radius="md">
                    <SliderNFT
                      style={styles}
                      currentMint={currentMint}
                      setCurrentMint={setCurrentMint}
                      trigger={trigger}
                      sliderRef={sliderRef}
                      showSlider={showSlider}
                      setFirstLoaded={setFirstLoaded}
                      firstImageRef={firstImageRef}
                    />
                  </Paper>
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
      <Confetti
        width={vWidth}
        height={sHeight}
        numberOfPieces={500}
        recycle={runConfetti}
        confettiSource={{
          x: confettiCoords.x,
          y: confettiCoords.y,
          w: 200,
          h: 100,
        }}
        run={initialRun}
        style={{ overflow: "visible", zIndex: "10000" }}
      />
    </>
  )
}

export default MintNFT

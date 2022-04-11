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
} from "@mantine/core"
import { useForm, yupResolver } from "@mantine/form"
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers"
import { ethers, BigNumber } from "ethers"
import * as yup from "yup"
import { FaCheck } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { showNotification } from "@mantine/notifications"
import { useClipboard } from "@mantine/hooks"
import { contractHash } from "../../test_contracts/testParams"
import mintTestAbi from "../../test_contracts/mintTestAbi.json"
import { GiBalloonDog } from "react-icons/gi"

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

  useEffect(() => {
    setOpened(true)
  }, [])

  const clipboard = useClipboard({ timeout: 500 })

  const sendSchema = yup.object().shape({
    amount: yup
      .number()
      .required("Amount is required")
      .typeError("Amount has to be a number")
      .positive("Amount has to be positive")
      .max(3, "Can only mint 3 at a time"),
  })

  const form = useForm({
    initialValues: {
      amount: "",
    },
    schema: yupResolver(sendSchema),
  })

  useEffect(() => {
    getBal()
  }, [address])

  async function handleMint(values: { amount: string }) {
    setLoading(true)
    if (window.ethereum && checkConnection() && signer) {
      const contract = new ethers.Contract(
        contractHash,
        mintTestAbi.abi,
        signer
      )

      try {
        const res = await contract.mint(BigNumber.from(values.amount))
        console.log(res)
        setLoading(false)
        // setFeedback("success")
        showNotification({
          title: "Successfully Minted",
          message: `Successfully minted ${values.amount} NFT${
            parseInt(values.amount) > 1 ? "'s" : ""
          }`,
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

  const rows = lastHashes.map((element) => (
    <tr key={element.hash}>
      <td>{element.hash}</td>
    </tr>
  ))

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
                backgroundColor:
                  theme.colorScheme === "dark" ? theme.colors.dark[4] : "",
              })}
            >
              Rinkeby Doges are magnificent pieces of art only available on the
              Rinkeby Testnet, switch your network to Rinkeby Test Network if
              you wish to mint them. There's an infinite supply of them
              available, however you may only mint 3 at a time.
            </Alert>
            <form onSubmit={form.onSubmit((values) => handleMint(values))}>
              <Text size="sm">Available: Unlimited</Text>
              <Text size="sm">Mint Price: 0.001</Text>
              <NumberInput
                defaultValue={1}
                label="Amount"
                required
                variant="filled"
                {...form.getInputProps("amount")}
              />
              <Text size="sm">
                Total: {0.001 * parseInt(form.values.amount)}
              </Text>
              <Group position="apart" mt="md">
                <Box>
                  {loading && <Loader className="loader" />}
                  {/* {feedback && <Text>{feedback}</Text>} */}
                </Box>

                <Button
                  mb="xs"
                  type="submit"
                  variant="outline"
                  disabled={loading}
                >
                  Mint
                </Button>
              </Group>
            </form>

            {/* {lastHashes.length > 0 && ( */}
            <Transition
              mounted={lastHashes.length > 0}
              transition="slide-up"
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <Accordion
                  style={styles}
                  iconPosition="right"
                  iconSize={40}
                  sx={
                    lastHashes.length > 0
                      ? {}
                      : { height: "40px", overflow: "hidden" }
                  }
                >
                  <Accordion.Item label="Last Hashes">
                    <Table
                      mt="md"
                      verticalSpacing="sm"
                      fontSize="xs"
                      striped
                      highlightOnHover
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : "",
                      })}
                    >
                      <thead>
                        <tr>
                          <th>TX Hash</th>
                        </tr>
                      </thead>
                      <tbody>{rows}</tbody>
                    </Table>
                  </Accordion.Item>
                </Accordion>
              )}
            </Transition>
          </Paper>
        </div>
      )}
    </Transition>
  )
}

export default MintNFT

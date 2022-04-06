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
} from "@mantine/core"
import { useForm, yupResolver } from "@mantine/form"
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers"
import { ethers } from "ethers"
import * as yup from "yup"
import "./Send.css"
import { FaCheck } from "react-icons/fa"
import { IoMdClose } from "react-icons/io"
import { showNotification } from "@mantine/notifications"

interface Props {
  address: string
  provider: Web3Provider | null
  jsonRpcProvider: JsonRpcProvider | null
  signer: ethers.providers.JsonRpcSigner | null
}

const Send: React.FC<Props> = ({
  address,
  provider,
  signer,
  jsonRpcProvider,
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

  const sendSchema = yup.object().shape({
    amount: yup
      .number()
      .required("Amount is required")
      .typeError("Amount has to be a number")
      .positive("Amount has to be positive")
      .max(balance, "Insufficient balance"),

    address: yup
      .string()
      .required("Address is required")
      .test("isValidAddress", "Invalid address", function (input) {
        return ethers.utils.isAddress(input!)
      }),
  })

  const form = useForm({
    initialValues: {
      amount: "",
      address: "",
    },
    schema: yupResolver(sendSchema),
  })

  useEffect(() => {
    getBal()
  }, [address])

  async function handleSend(values: { amount: string; address: string }) {
    setLoading(true)
    if (signer) {
      try {
        const tx = await signer.sendTransaction({
          to: values.address,
          value: ethers.utils.parseEther(values.amount),
        })
        setLoading(false)
        setLastHashes([...lastHashes, { hash: tx.hash }])
        setFeedback("success")
        showNotification({
          title: "Successfully Sent",
          message: `${values.amount} ETH to ${values.address}`,
          color: "sandboxGreen",
          icon: <FaCheck />,
        })
      } catch (e: any) {
        setFeedback("failed")
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
    const bal = await jsonRpcProvider?.getBalance(address)
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
            <Title order={2}>Send</Title>
            <Badge mt="md" color={address !== "" ? "" : "orange"}>
              {address !== "" ? address : "awaiting connection"}
            </Badge>
            <form onSubmit={form.onSubmit((values) => handleSend(values))}>
              <TextInput
                mt="md"
                type="number"
                required
                label="Amount"
                {...form.getInputProps("amount")}
              />
              <TextInput
                required
                label="Address"
                placeholder="0x..."
                {...form.getInputProps("address")}
              />
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
                  Send
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

export default Send

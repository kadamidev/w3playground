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

  return (
    <div>
      <Paper shadow="sm" p="xl" withBorder sx={{ position: "relative" }}>
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

            <Button type="submit" variant="outline" disabled={loading}>
              Send
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  )
}

export default Send

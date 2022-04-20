import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Carousel } from "react-responsive-carousel"
import React, { useEffect, useState } from "react"
import "./SliderNFT.css"
import { Transition, Image as MImage, useMantineTheme } from "@mantine/core"

import { useMediaQuery } from "@mantine/hooks"
import { CurrentMintI } from "../MintNFT/MintNFT"

const ipfs_gateways = [
  "https://ipfs.cf-ipfs.com/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://cf-ipfs.com/ipfs/",
  "https://ipfs.infura.io/ipfs/",
  "https://infura-ipfs.io/ipfs/",
  "https://crustwebsites.net/ipfs/",
  "https://ipfs.fleek.co/ipfs/",
  "https://dweb.link/ipfs/",
]

interface Props {
  style: React.CSSProperties
  currentMint: CurrentMintI[]
  setCurrentMint: React.Dispatch<React.SetStateAction<CurrentMintI[]>>
  trigger: () => Promise<void>
  sliderRef: React.RefObject<HTMLDivElement>
  showSlider: boolean
  setFirstLoaded: React.Dispatch<React.SetStateAction<boolean>>
  firstImageRef: React.RefObject<HTMLImageElement>
}

const SliderNFT: React.FC<Props> = ({
  currentMint,
  setCurrentMint,
  sliderRef,
  trigger,
  showSlider,
  setFirstLoaded,
  firstImageRef,
}) => {
  const theme = useMantineTheme()
  const isXs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`)
  const [preloaded, setPreloaded] = useState<boolean>(false)
  const [finishedArr, setFinishedArr] = useState<number[]>([])

  const falseShowSlider = showSlider === false

  useEffect(() => {
    console.log("new mint, resetting preloaded and finished arr")
    setPreloaded(false)
    setFinishedArr([])
    console.log("false show slider ran")
  }, [falseShowSlider])

  useEffect(() => {
    console.table(currentMint)
    if (currentMint.length && !preloaded) {
      console.log("preload triggered")
      setPreloaded(true)
      const img: HTMLImageElement = new Image()
      img.src = `${ipfs_gateways[0]}${currentMint[0].uri}`
      img.onload = () => {
        setFinishedArr([0, ...finishedArr])
        setFirstLoaded(true)
      }
      if (currentMint.length > 1) {
        for (let i = 1; i < currentMint.length; i++) {
          console.log("calling preload on img: ", i)
          preload(i)
        }
      }
    }
  }, [currentMint])

  async function preload(index: number) {
    console.log("hit preload")
    const img: HTMLImageElement = new Image()
    img.src = `${ipfs_gateways[0]}${currentMint[index].uri}`

    img.onload = async () => {
      console.log("index:", index, "loaded, setting to loaded")
      setFinishedArr([index, ...finishedArr])
    }
  }

  useEffect(() => {
    console.log("finished Arr", finishedArr)
    const lastLoaded = finishedArr[0]
    console.log("lastLoaded: ", lastLoaded)
    setCurrentMint(
      currentMint.map((item, idx) =>
        idx === lastLoaded ? { ...item, loaded: true } : item
      )
    )
  }, [finishedArr])

  function handleSeen(index: number) {
    if (!currentMint[index].seen && currentMint[index].loaded) {
      trigger()
      setCurrentMint(
        currentMint.map((item, idx) =>
          idx === index ? { ...item, seen: true } : item
        )
      )
    }
  }

  return (
    <Transition
      mounted={showSlider}
      transition="pop"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <div ref={sliderRef} style={styles}>
          <Carousel
            onChange={(idx) => handleSeen(idx)}
            width={isXs ? "300px" : "220px"}
            showThumbs={false}
            showStatus={false}
          >
            {currentMint.map((item, index) => (
              <div className="slideWrapper" key={item.uri}>
                <MImage
                  ref={index === 0 ? firstImageRef : null}
                  radius="md"
                  src={`${ipfs_gateways[0]}${item.uri}`}
                  alt="Rinkeby Doge"
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </Transition>
  )
}

export default SliderNFT

import { getCurrentPriceInCentsPerSat, getMidPriceRatio } from "@app/shared"

import { NewDealerPriceService } from "@services/dealer-price"

jest.mock("@services/dealer-price", () => require("test/mocks/dealer-price"))
jest.mock("@app/prices/get-current-price", () => require("test/mocks/get-current-price"))

describe("getMidPriceRatio", () => {
  const fetchPrices = async () => {
    const dealerMidPriceRatio =
      await NewDealerPriceService().getCentsPerSatsExchangeMidRate()
    if (dealerMidPriceRatio instanceof Error) throw dealerMidPriceRatio

    const priceMidPriceRatio = await getCurrentPriceInCentsPerSat()
    if (priceMidPriceRatio instanceof Error) throw priceMidPriceRatio

    return {
      dealerMidPriceRatio: dealerMidPriceRatio.usdPerSat(),
      priceMidPriceRatio: priceMidPriceRatio.usdPerSat(),
    }
  }

  it("fetches mid price from price server", async () => {
    const usdHedgeEnabled = false
    const midPriceRatioResult = await getMidPriceRatio(usdHedgeEnabled)
    if (midPriceRatioResult instanceof Error) throw midPriceRatioResult
    const midPriceRatio = midPriceRatioResult.usdPerSat()

    const priceRatios = await fetchPrices()
    const { dealerMidPriceRatio, priceMidPriceRatio } = priceRatios

    expect(dealerMidPriceRatio).not.toEqual(priceMidPriceRatio)
    expect(midPriceRatio).toEqual(priceMidPriceRatio)
  })

  it("fetches mid price from dealer server", async () => {
    const usdHedgeEnabled = true
    const midPriceRatioResult = await getMidPriceRatio(usdHedgeEnabled)
    if (midPriceRatioResult instanceof Error) throw midPriceRatioResult
    const midPriceRatio = midPriceRatioResult.usdPerSat()

    const priceRatios = await fetchPrices()
    const { dealerMidPriceRatio, priceMidPriceRatio } = priceRatios

    expect(dealerMidPriceRatio).not.toEqual(priceMidPriceRatio)
    expect(midPriceRatio).toEqual(dealerMidPriceRatio)
  })
})

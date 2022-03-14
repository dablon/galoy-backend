type PaymentFlowState<S extends WalletCurrency, R extends WalletCurrency> = {
  senderWalletId: WalletId
  senderWalletCurrency: S
  settlementMethod: SettlementMethod
  paymentInitiationMethod: PaymentInitiationMethod
  paymentHash: PaymentHash

  btcPaymentAmount: BtcPaymentAmount
  usdPaymentAmount: UsdPaymentAmount
  inputAmount: BigInt

  btcProtocolFee: BtcPaymentAmount
  usdProtocolFee: UsdPaymentAmount

  recipientWalletId?: WalletId
  recipientWalletCurrency?: R

  outgoingNodePubkey?: Pubkey
  cachedRoute?: RawRoute
}

type PaymentFlow<S extends WalletCurrency, R extends WalletCurrency> = PaymentFlowState<
  S,
  R
> & {
  protocolFeeInSenderWalletCurrency(): PaymentAmount<S>
}

type LightningPaymentFlowBuilder<S extends WalletCurrency> = {
  withSenderWallet(senderWallet: WalletDescriptor<S>): LightningPaymentFlowBuilder<S>
  withInvoice(invoice: LnInvoice): LightningPaymentFlowBuilder<S>
  withUncheckedAmount(amount: number): LightningPaymentFlowBuilder<S>
  withBtcAmount(amount: BtcPaymentAmount): LightningPaymentFlowBuilder<S>
  withRouteResult(routeResult: {
    pubkey: Pubkey
    rawRoute: RawRoute
  }): LightningPaymentFlowBuilder<S>
  needsProtocolFee(): boolean
  btcPaymentAmount(): BtcPaymentAmount | undefined
  usdPaymentAmount(): UsdPaymentAmount | undefined
  payment(): PaymentFlowOld<S> | ValidationError
}

type LightningPaymentBuilderState<S extends WalletCurrency> = {
  localNodeIds: Pubkey[]
  validationError?: ValidationError
  senderWalletId?: WalletId
  senderWalletCurrency?: S
  settlementMethod?: SettlementMethod
  btcProtocolFee?: BtcPaymentAmount
  usdProtocolFee?: UsdPaymentAmount

  outgoingNodePubkey?: Pubkey
  cachedRoute?: RawRoute

  btcPaymentAmount?: BtcPaymentAmount
  usdPaymentAmount?: UsdPaymentAmount
  invoice?: LnInvoice
  uncheckedAmount?: number
  inputAmount?: BigInt
}

interface IPaymentFlowRepository {
  persistNew<S extends WalletCurrency>(
    payment: PaymentFlowOld<S>,
  ): Promise<PaymentFlowOld<S> | RepositoryError>
  findLightningPaymentFlow<S extends WalletCurrency>({
    walletId,
    paymentHash,
    inputAmount,
  }: {
    walletId: WalletId
    paymentHash: PaymentHash
    inputAmount: BigInt
  }): Promise<PaymentFlowOld<S> | RepositoryError>
}

type AmountConverterConfig = {
  dealerFns: IDealerPriceServiceNew
}
type AmountConverter = {
  addAmountsForFutureBuy<S extends WalletCurrency>(
    builder: LightningPaymentFlowBuilder<S>,
  ): Promise<LightningPaymentFlowBuilder<S> | DealerPriceServiceError>
}

type LightningPaymentFlowBuilderConfig = {
  localNodeIds: Pubkey[]
  usdFromBtcMidPriceFn(
    amount: BtcPaymentAmount,
  ): Promise<UsdPaymentAmount | DealerPriceServiceError>
  btcFromUsdMidPriceFn(
    amount: UsdPaymentAmount,
  ): Promise<BtcPaymentAmount | DealerPriceServiceError>
}

type LPFBWithInvoiceState = LightningPaymentFlowBuilderConfig & {
  paymentHash: PaymentHash
  settlementMethod: SettlementMethod
  btcPaymentAmount?: BtcPaymentAmount
  inputAmount?: BigInt
  uncheckedAmount?: number
  btcProtocolFee?: BtcPaymentAmount
  usdProtocolFee?: UsdPaymentAmount
}

type LPFBWithSenderWalletState<S extends WalletCurrency> = RequireField<
  LPFBWithInvoiceState,
  "inputAmount"
> & {
  senderWalletId: WalletId
  senderWalletCurrency: S
  usdPaymentAmount?: UsdPaymentAmount
}

type LPFBWithRecipientWalletState<
  S extends WalletCurrency,
  R extends WalletCurrency,
> = LPFBWithSenderWalletState<S> & {
  recipientWalletId?: WalletId
  recipientWalletCurrency?: R
}

type LPFBWithConversionState<
  S extends WalletCurrency,
  R extends WalletCurrency,
> = RequireField<
  LPFBWithRecipientWalletState<S, R>,
  "btcPaymentAmount" | "btcProtocolFee" | "usdProtocolFee" | "usdPaymentAmount"
>

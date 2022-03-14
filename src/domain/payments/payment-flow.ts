import { WalletCurrency } from "@domain/shared"

export const PaymentFlow = <S extends WalletCurrency, R extends WalletCurrency>(
  state: PaymentFlowState<S, R>,
): PaymentFlow<S, R> => {
  const protocolFeeInSenderWalletCurrency = (): PaymentAmount<S> => {
    if (state.senderWalletCurrency === WalletCurrency.Btc) {
      return state.btcProtocolFee as PaymentAmount<S>
    }
    return state.usdProtocolFee as PaymentAmount<S>
  }

  return {
    ...state,
    protocolFeeInSenderWalletCurrency,
  }
}
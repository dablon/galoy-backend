import { Accounts } from "@app"
import { checkedToUsername } from "@domain/accounts"
import { GT } from "@graphql/index"
import dedent from "dedent"
import { connectionArgs, connectionFromArray } from "graphql-relay"

import ContactAlias from "../scalar/contact-alias"
import Username from "../scalar/username"

import { TransactionConnection } from "./transaction"

const AccountContact = new GT.Object({
  name: "UserContact",
  fields: () => ({
    id: { type: GT.NonNull(Username) },
    username: {
      type: GT.NonNull(Username),
      description: "Actual identifier of the contact.",
    },
    alias: {
      type: ContactAlias,
      description: dedent`Alias the user can set for this contact.
        Only the user can see the alias attached to their contact.`,
    },
    transactionsCount: {
      type: GT.NonNull(GT.Int),
    },
    transactions: {
      type: TransactionConnection,
      args: connectionArgs,
      resolve: async (source, args, { domainAccount }) => {
        const contactUsername = checkedToUsername(source.username)

        if (contactUsername instanceof Error) {
          throw contactUsername
        }

        const account = domainAccount

        if (account instanceof Error) {
          throw account
        }

        const transactions = await Accounts.getAccountTransactionsForContact({
          account,
          contactUsername,
        })

        if (transactions instanceof Error) {
          throw transactions
        }

        return connectionFromArray(transactions, args)
      },
      description: "Paginated list of transactions sent to/from this contact.",
    },
  }),
})

export default AccountContact
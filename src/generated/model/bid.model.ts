import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {Auction} from "./auction.model"
import {Parachain} from "./parachain.model"
import {Crowdloan} from "./crowdloan.model"

@Entity_()
export class Bid {
  constructor(props?: Partial<Bid>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Auction, {nullable: false})
  auction!: Auction

  @Column_("integer", {nullable: true})
  winningAuction!: number | undefined | null

  @Column_("integer", {nullable: false})
  blockNum!: number

  @Index_()
  @ManyToOne_(() => Parachain, {nullable: false})
  parachain!: Parachain

  @Column_("bool", {nullable: false})
  isCrowdloan!: boolean

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Index_()
  @ManyToOne_(() => Crowdloan, {nullable: true})
  fund!: Crowdloan | undefined | null

  @Column_("integer", {nullable: false})
  firstSlot!: number

  @Column_("integer", {nullable: false})
  lastSlot!: number

  @Column_("text", {nullable: true})
  bidder!: string | undefined | null

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}

import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {Parachain} from "./parachain.model"
import {Auction} from "./auction.model"

@Entity_()
export class ParachainLeases {
  constructor(props?: Partial<ParachainLeases>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  paraId!: number

  @Index_()
  @ManyToOne_(() => Parachain, {nullable: false})
  parachain!: Parachain

  @Column_("text", {nullable: false})
  leaseRange!: string

  @Column_("integer", {nullable: false})
  firstLease!: number

  @Column_("integer", {nullable: false})
  lastLease!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  latestBidAmount!: bigint

  @Index_()
  @ManyToOne_(() => Auction, {nullable: true})
  auction!: Auction | undefined | null

  @Column_("text", {nullable: true})
  activeForAuction!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  winningAmount!: bigint | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  extraAmount!: bigint | undefined | null

  @Column_("text", {nullable: true})
  wonBidFrom!: string | undefined | null

  @Column_("integer", {nullable: true})
  numBlockWon!: number | undefined | null

  @Column_("integer", {nullable: true})
  winningResultBlock!: number | undefined | null

  @Column_("bool", {nullable: false})
  hasWon!: boolean
}

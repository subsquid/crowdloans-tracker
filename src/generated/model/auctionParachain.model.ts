import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Auction} from "./auction.model"
import {Parachain} from "./parachain.model"

@Entity_()
export class AuctionParachain {
  constructor(props?: Partial<AuctionParachain>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Auction, {nullable: false})
  auction!: Auction

  @Index_()
  @ManyToOne_(() => Parachain, {nullable: false})
  parachain!: Parachain

  @Column_("integer", {nullable: false})
  blockNum!: number

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date

  @Column_("integer", {nullable: false})
  firstSlot!: number

  @Column_("integer", {nullable: false})
  lastSlot!: number
}

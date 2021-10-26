import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Auction} from "./auction.model"
import {Parachain} from "./parachain.model"

@Entity_()
export class Chronicle {
  constructor(props?: Partial<Chronicle>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Auction, {nullable: true})
  curAuction!: Auction | undefined | null

  @Column_("text", {nullable: true})
  curAuctionId!: string | undefined | null

  @Column_("integer", {nullable: true})
  curBlockNum!: number | undefined | null

  @Column_("integer", {nullable: true})
  curLease!: number | undefined | null

  @Column_("integer", {nullable: true})
  curLeaseStart!: number | undefined | null

  @Column_("integer", {nullable: true})
  curLeaseEnd!: number | undefined | null

  @OneToMany_(() => Parachain, e => e.chronicle)
  parachains!: Parachain[]
}

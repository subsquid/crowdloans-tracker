import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Bid} from "./bid.model"
import {ParachainLeases} from "./parachainLeases.model"

@Entity_()
export class Auction {
  constructor(props?: Partial<Auction>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  blockNum!: number

  @Column_("text", {nullable: false})
  status!: string

  @OneToMany_(() => Bid, e => e.auction)
  bids!: Bid[]

  @Column_("integer", {nullable: true})
  leaseStart!: number | undefined | null

  @Column_("integer", {nullable: false})
  slotsStart!: number

  @Column_("integer", {nullable: true})
  leaseEnd!: number | undefined | null

  @Column_("integer", {nullable: false})
  slotsEnd!: number

  @Column_("integer", {nullable: false})
  closingStart!: number

  @Column_("integer", {nullable: false})
  closingEnd!: number

  @Column_("integer", {nullable: true})
  resultBlock!: number | undefined | null

  @Column_("bool", {nullable: false})
  ongoing!: boolean

  @OneToMany_(() => ParachainLeases, e => e.auction)
  parachainLeases!: ParachainLeases[]

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}

import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {ParachainLeases} from "./parachainLeases.model"
import {Bid} from "./bid.model"
import {Crowdloan} from "./crowdloan.model"
import {Chronicle} from "./chronicle.model"

@Entity_()
export class Parachain {
  constructor(props?: Partial<Parachain>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  paraId!: number

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date

  @Column_("integer", {nullable: true})
  creationBlock!: number | undefined | null

  @Column_("bool", {nullable: false})
  deregistered!: boolean

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  deposit!: bigint

  @Column_("text", {nullable: false})
  manager!: string

  @OneToMany_(() => ParachainLeases, e => e.parachain)
  leases!: ParachainLeases[]

  @OneToMany_(() => Bid, e => e.parachain)
  bids!: Bid[]

  @OneToMany_(() => Crowdloan, e => e.parachain)
  funds!: Crowdloan[]

  @Index_()
  @ManyToOne_(() => Crowdloan, {nullable: true})
  activeFund!: Crowdloan | undefined | null

  @Index_()
  @ManyToOne_(() => Bid, {nullable: true})
  latestBid!: Bid | undefined | null

  @Index_()
  @ManyToOne_(() => Chronicle, {nullable: true})
  chronicle!: Chronicle | undefined | null
}

import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "../marshal"
import {Parachain} from "./parachain.model"
import {Crowdloan} from "./crowdloan.model"

@Entity_()
export class Contribution {
  constructor(props?: Partial<Contribution>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  account!: string

  @Index_()
  @ManyToOne_(() => Parachain, {nullable: false})
  parachain!: Parachain

  @Index_()
  @ManyToOne_(() => Crowdloan, {nullable: false})
  fund!: Crowdloan

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Column_("integer", {nullable: false})
  blockNum!: number

  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}

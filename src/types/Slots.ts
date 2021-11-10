import {create} from './_registry'
import {AccountId32} from '@polkadot/types/interfaces'
import {u128, u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Slots {
  /**
   * A new `[lease_period]` is beginning.
   */
  export class NewLeasePeriodEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32] {
      return [create('u32', this.event.params[0].value)]
    }
  }

  /**
   * A para has won the right to a continuous set of lease periods as a parachain.
   * First balance is any extra amount reserved on top of the para's existing deposit.
   * Second balance is the total amount reserved.
   * `[parachain_id, leaser, period_begin, period_count, extra_reserved, total_amount]`
   */
  export class LeasedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32, AccountId32, u32, u32, u128, u128] {
      return [create('u32', this.event.params[0].value), create('AccountId32', this.event.params[1].value), create('u32', this.event.params[2].value), create('u32', this.event.params[3].value), create('u128', this.event.params[4].value), create('u128', this.event.params[5].value)]
    }
  }

}

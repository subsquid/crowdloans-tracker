import {create} from './_registry'
import {AccountId32} from '@polkadot/types/interfaces'
import {u128, u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Crowdloan {
  /**
   * Create a new crowdloaning campaign. `[fund_index]`
   */
  export class CreatedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32] {
      return [create('u32', this.event.params[0].value)]
    }
  }

  /**
   * Contributed to a crowd sale. `[who, fund_index, amount]`
   */
  export class ContributedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [AccountId32, u32, u128] {
      return [create('AccountId32', this.event.params[0].value), create('u32', this.event.params[1].value), create('u128', this.event.params[2].value)]
    }
  }

  /**
   * Fund is dissolved. `[fund_index]`
   */
  export class DissolvedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32] {
      return [create('u32', this.event.params[0].value)]
    }
  }

}

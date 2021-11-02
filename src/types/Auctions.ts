import {create} from './_registry'
import {AccountId32} from '@polkadot/types/interfaces'
import {u128, u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Auctions {
  /**
   * An auction started. Provides its index and the block number where it will begin to
   * close and the first lease period of the quadruplet that is auctioned.
   * `[auction_index, lease_period, ending]`
   */
  export class AuctionStartedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32, u32, u32] {
      return [create('u32', this.event.params[0].value), create('u32', this.event.params[1].value), create('u32', this.event.params[2].value)]
    }
  }

  /**
   * An auction ended. All funds become unreserved. `[auction_index]`
   */
  export class AuctionClosedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32] {
      return [create('u32', this.event.params[0].value)]
    }
  }

  /**
   * A new bid has been accepted as the current winner.
   * `[who, para_id, amount, first_slot, last_slot]`
   */
  export class BidAcceptedEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [AccountId32, u32, u128, u32, u32] {
      return [create('AccountId32', this.event.params[0].value), create('u32', this.event.params[1].value), create('u128', this.event.params[2].value), create('u32', this.event.params[3].value), create('u32', this.event.params[4].value)]
    }
  }

}

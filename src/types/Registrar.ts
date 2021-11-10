import {create} from './_registry'
import {AccountId32} from '@polkadot/types/interfaces'
import {u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Registrar {
  export class RegisteredEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32, AccountId32] {
      return [create('u32', this.event.params[0].value), create('AccountId32', this.event.params[1].value)]
    }
  }

}

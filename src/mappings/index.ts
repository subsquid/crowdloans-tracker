import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { Account, Parachain, Auction, Chronicle } from '../generated/model'
import {  Registrar, Auctions } from '../types'
import { apiService } from './api'


async function getOrCreate<T extends {id: string}>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {

  let e = await store.get(entityConstructor, {
    where: { id },
  })

  if (e == null) {
    e = new entityConstructor()
    e.id = id
  }

  return e
}


type EntityConstructor<T> = {
  new (...args: any[]): T
}



// export async function handleParachainRegistration({
//   store,
//   event,
//   block,
// }: EventContext & StoreContext): Promise<void> {

//   const [paraId, managerId] = new Registrar.RegisteredEvent(event).params

//   const parachain = await getOrCreate(store, Parachain, `${paraId}-${managerId.toHex()}`)

//   let api = await apiService()
//   const { deposit } = (await api.query.registrar.paras(paraId)).toJSON() || { deposit: 0 };

//   parachain.paraId = paraId.toNumber()
//   parachain.createdAt = new Date(block.timestamp)
//   parachain.manager = managerId.toHex()
//   parachain.deposit = deposit
//   parachain.creationBlock = block.height
//   parachain.deregistered = false

//   await store.save(parachain)
// };

export async function handleAuctionStarted({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {

  const [auctionId, slotStart, auctionEnds] = new Auctions.AuctionStartedEvent(event).params

  let api = await apiService()
  const endingPeriod = api.consts.auctions.endingPeriod.toJSON() as number;
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  const periods = api.consts.auctions.leasePeriodsPerSlot.toJSON() as number;

  const auction = await getOrCreate(store, Auction, auctionId.toString())

  auction.blockNum = block.height
  auction.status = 'Started'
  auction.slotsStart = slotStart.toNumber()
  auction.slotsEnd = slotStart.toNumber() + periods - 1
  auction.leaseStart = slotStart.toNumber() * leasePeriod
  auction.leaseEnd = (slotStart.toNumber() + periods - 1) * leasePeriod
  // auction.createdAt = (block.timestamp)
  auction.closingStart = auctionEnds.toNumber()
  auction.ongoing = true
  auction.closingEnd = auctionEnds.toNumber() + endingPeriod
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, 'ChronicleKey')
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);
};
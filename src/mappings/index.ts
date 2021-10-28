import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common'
import { Account, Parachain, Auction } from '../generated/model'
import { Balances, Registrar, Auctions } from '../types'
import { service,  } from './api'


// export async function balancesTransfer({
//   store,
//   event,
//   block,
//   extrinsic,
// }: EventContext & StoreContext): Promise<void> {

//   const [from, to, value] = new Balances.TransferEvent(event).params
//   const tip = extrinsic?.tip || 0n

//   const fromAcc = await getOrCreate(store, Account, from.toHex())
//   fromAcc.wallet = from.toHuman()
//   fromAcc.balance = fromAcc.balance || 0n
//   fromAcc.balance -= value.toBigInt()
//   fromAcc.balance -= tip
//   await store.save(fromAcc)

//   const toAcc = await getOrCreate(store, Account, to.toHex())
//   toAcc.wallet = to.toHuman()
//   toAcc.balance = toAcc.balance || 0n
//   toAcc.balance += value.toBigInt()
//   await store.save(toAcc)

//   const hbFrom = new HistoricalBalance()
//   hbFrom.account = fromAcc;
//   hbFrom.balance = fromAcc.balance;
//   hbFrom.timestamp = new Date(block.timestamp)
//   await store.save(hbFrom)

//   const hbTo = new HistoricalBalance()
//   hbTo.account = toAcc;
//   hbTo.balance = toAcc.balance;
//   hbTo.timestamp = new Date(block.timestamp)
//   await store.save(hbTo)
// }


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



export async function handleParachainRegistration({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {

  const [paraId, managerId] = new Registrar.RegisteredEvent(event).params

  const parachain = await getOrCreate(store, Parachain, `${paraId}-${managerId.toHex()}`)

  let api = await service()
  const { deposit } = (await api.query.registrar.paras(paraId)).toJSON() || { deposit: 0 };

  parachain.paraId = paraId.toNumber()
  parachain.createdAt = new Date(block.timestamp)
  parachain.manager = managerId.toHex()
  parachain.deposit = deposit
  parachain.creationBlock = block.height
  parachain.deregistered = false

  await store.save(parachain)
};

// export async function handleAuctionStarted({
//   store,
//   event,
//   block,
// }: EventContext & StoreContext): Promise<void> {

//   const [auctionId, slotStart, auctionEnds] = new Auctions.AuctionStartedEvent(event).params

//   let api = await service()
//   const endingPeriod = api.consts.auctions.endingPeriod.toJSON() as number;
//   const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
//   const periods = api.consts.auctions.leasePeriodsPerSlot.toJSON() as number;

//   const auction = await getOrCreate(store, Auction, auctionId.toString())

//   auction.blockNum = block.height
//   auction.status = 'Started'
//   auction.slotsStart = slotStart.toNumber()
//   auction.slotsEnd = slotStart.toNumber() + periods - 1
//   auction.leaseStart = slotStart.toNumber() * leasePeriod
//   auction.leaseEnd = (slotStart.toNumber() + periods - 1) * leasePeriod
//   auction.createdAt = new Date(block.timestamp)
//   auction.closingStart = auctionEnds.toNumber()
//   auction.ongoing = true
//   auction.closingEnd = auctionEnds.toNumber() + endingPeriod
//   await store.save(auction);

//   // const chronicle = await getOrCreate(store, Models.Chronicle, 'ChronicleKey')
//   // chronicle.curAuctionId = auctionId.toString();
//   // await store.save(chronicle);
// };
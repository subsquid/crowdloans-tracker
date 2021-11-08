import { DatabaseManager, EventContext, StoreContext } from "@subsquid/hydra-common";
import { Auction, AuctionParachain, Bid, Chronicle, ParachainLeases } from "../generated/model";
import { Auctions } from "../types";
import { apiService } from "./helpers/api";
import {
  ensureFund,
  ensureParachain,
  getByAuctionParachain,
  getByAuctions,
  getByLeaseRange,
  getByWinningAuction,
  getLatestCrowdloanId,
  getOrCreate,
  getOrUpdate,
} from "./helpers/common";
import { isFundAddress } from "./helpers/utils";



export async function handlerEmpty () {};

export async function handleAuctionStarted({
  store,
  event,
  block
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ Auctions AuctionStarted Event Startd.`);

  const [auctionId, slotStart, auctionEnds] = new Auctions.AuctionStartedEvent(
    event
  ).params;

  let api = await apiService();
  const endingPeriod = api.consts.auctions.endingPeriod.toJSON() as number;
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  const periods = api.consts.auctions.leasePeriodsPerSlot.toJSON() as number;

  const auction = await getOrCreate(store, Auction, auctionId.toString());

  auction.blockNum = block.height;
  auction.status = "Started";
  auction.slotsStart = slotStart.toNumber();
  auction.slotsEnd = slotStart.toNumber() + periods - 1;
  auction.leaseStart = slotStart.toNumber() * leasePeriod;
  auction.leaseEnd = (slotStart.toNumber() + periods - 1) * leasePeriod;
  auction.closingStart = auctionEnds.toNumber();
  auction.ongoing = true;
  auction.closingEnd = auctionEnds.toNumber() + endingPeriod;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, "ChronicleKey");
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);

  console.info(` ------ Auctions AuctionStarted Event Completed.`);
}

export async function handleAuctionClosed({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Auctions] [AuctionClosed] Event Startd.`);

  const [auctionId] = new Auctions.AuctionClosedEvent(event).params;
  const auction = await getOrCreate(store, Auction, auctionId.toString());

  auction.blockNum = block.height;
  auction.status = "Closed";
  auction.ongoing = false;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, "ChronicleKey");
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);

  console.info(` ------ [Auctions] [AuctionClosed] Event Completed.`);
  
}


/**
 *
 * @param substrateEvent SubstrateEvent
 * Create Bid record and create auction parachain record if not exists already
 * Skip winning bid before we have query abilities
 */
export async function handleBidAccepted({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const { timestamp: createdAt } = block;
  const blockNum = block.height;
  const [from, paraId, amount, firstSlot, lastSlot] =
    new Auctions.BidAcceptedEvent(event).params;
  const api = await apiService();
  const auctionId = (
    await api.query.auctions.auctionCounter()
  ).toJSON() as number;
  const isFund = await isFundAddress(from.toHex());
  const parachain = await ensureParachain(paraId.toNumber(), store);
  const bidAmount = amount.toNumber();
  const auction = await getOrCreate(store, Auction, auctionId.toString());
  const fund = await ensureFund(paraId.toNumber(), store);
  // const bid = await getOrUpdate(store, Bid, `${blockNum}-${from}-${paraId}-${firstSlot}-${lastSlot}`, {
  //   auction,
  //   blockNum,
  //   winningAuction: auctionId,
  //   parachain,
  //   isCrowdloan: isFund,
  //   amount: BigInt(bidAmount),
  //   firstSlot: firstSlot.toNumber(),
  //   lastSlot: lastSlot.toNumber(),
  //   createdAt: new Date(createdAt),
  //   fund,
  //   bidder: isFund ? null : from.toHex(),
  // })

  // const bid = new Bid({
  //   id: `${blockNum}-${from}-${paraId}-${firstSlot}-${lastSlot}`,
  //   auction,
  //   blockNum,
  //   winningAuction: auctionId,
  //   parachain,
  //   isCrowdloan: isFund,
  //   amount: BigInt(bidAmount),
  //   firstSlot: firstSlot.toNumber(),
  //   lastSlot: lastSlot.toNumber(),
  //   createdAt: new Date(createdAt),
  //   fund,
  //   bidder: isFund ? null : from.toHex(),
  // });

  // console.log(" bid :::: ",bid)
  // const { id: bidId } = (await store.save(bid)) as any;
  // console.info(`Bid saved: ${bidId}`);

  // await markParachainLeases(auctionId, paraId.toNumber(), firstSlot.toNumber(), lastSlot.toNumber(), bidAmount, store);

  // await markLosingBids(auctionId, firstSlot.toNumber(), lastSlot.toNumber(), bidId, store);

  // const auctionParaId = `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`;
  // const auctionPara = await getOrUpdate(store, AuctionParachain, auctionParaId, {});
  // if (!auctionPara) {
  //   const auctionParachainData = new AuctionParachain({
  //     id: `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`,
  //     parachainId,
  //     auctionId:auctionId?.toString(),
  //     firstSlot,
  //     lastSlot,
  //     createdAt,
  //     blockNum
  //   })
  //   const { id } = await store.save(auctionParachainData) as any;
  //   console.info(`Create AuctionParachain: ${id}`);
  // }
}



// const markParachainLeases = async (
//   auctionId: number,
//   paraId: number,
//   leaseStart: number,
//   leaseEnd: number,
//   bidAmount: number,
//   store: DatabaseManager
// ) => {
//   const leaseRange = `${auctionId}-${leaseStart}-${leaseEnd}`;
//   const { id: parachainId } = await ensureParachain(paraId, store);
//   const winningLeases = (await getByLeaseRange(store, leaseRange)) || [];
//   const losingLeases = winningLeases.filter((lease: any) => lease.paraId !== paraId);
//   for (const lease of losingLeases) {
//     lease.activeForAuction = null;
//     await lease.save();
//     console.info(`Mark losing parachain leases ${lease.paraId} for ${lease.leaseRange}`);
//   }
//   await getOrUpdate(store, ParachainLeases, `${paraId}-${leaseRange}`, {
//     paraId,
//     leaseRange,
//     parachainId,
//     firstLease: leaseStart,
//     lastLease: leaseEnd,
//     auctionId: auctionId?.toString(),
//     latestBidAmount: bidAmount,
//     activeForAuction: auctionId?.toString(),
//     hasWon: false
//   });
// };

// const markLosingBids = async (auctionId: number, slotStart: number, slotEnd: number, winningBidId: string, store: DatabaseManager) => {
//   const winningBids = (await getByWinningAuction(store, auctionId)) || [];
//   const losingBids = winningBids.filter(
//     ({ firstSlot, lastSlot, id }) => id !== winningBidId && slotStart == firstSlot && slotEnd == lastSlot
//   );
//   for (const bid of losingBids) {
//     bid.winningAuction = null;
//     await bid.save();
//     console.info(`Mark Bid as losing bid ${bid.id}`);
//   }
// };



export async function handleAuctionWinningOffset ({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Auctions] [WinningOffset] Event Startd.`);

  const [auctionId, offsetBlock] = new Auctions.WinningOffsetEvent(event).params;
  const auction = await getByAuctions(store, auctionId.toString());
  console.log(" auction :::: ",auction)
  // auction[0].resultBlock = auction.closingStart + offsetBlock.toString();
  // console.info(`Update auction ${auctionId} winning offset: ${auction.resultBlock}`);
  // await auction.save();

  console.info(` ------ [Auctions] [WinningOffset] Event Completed.`);
};
import { DatabaseManager, EventContext, StoreContext } from "@subsquid/hydra-common";
import { Auction, AuctionParachain, Bid, ParachainLeases } from "../generated/model";
import { Auctions } from "../types";
import { apiService } from "./helpers/api";
import {
  ensureFund,
  ensureParachain,
  getByLeaseRange,
  getLatestCrowdloanId,
  getOrCreate,
  getOrUpdate,
} from "./helpers/common";
import { isFundAddress } from "./helpers/utils";

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
  const bid = new Bid({
    id: `${blockNum}-${from}-${paraId}-${firstSlot}-${lastSlot}`,
    auction,
    blockNum,
    winningAuction: auctionId,
    parachain,
    isCrowdloan: isFund,
    amount: BigInt(bidAmount),
    firstSlot: firstSlot.toNumber(),
    lastSlot: lastSlot.toNumber(),
    createdAt: new Date(createdAt),
    fund,
    bidder: isFund ? null : from.toHex(),
  });

  const { id: bidId } = (await store.save(bid)) as any;
  console.info(`Bid saved: ${bidId}`);

  // await markParachainLeases(auctionId, paraId.toNumber(), firstSlot.toNumber(), lastSlot.toNumber(), bidAmount, store);

  // await markLosingBids(auctionId, firstSlot, lastSlot, bidId);

  // const auctionParaId = `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`;
  // const auctionPara = await AuctionParachain.get(auctionParaId);
  // if (!auctionPara) {
  //   const { id } = await Storage.save('AuctionParachain', {
  //     id: `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`,
  //     parachainId,
  //     auctionId:auctionId?.toString(),
  //     firstSlot,
  //     lastSlot,
  //     createdAt,
  //     blockNum
  //   });
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
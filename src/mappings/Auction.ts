import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Auction, AuctionParachain, Bid, Chronicle } from "../generated/model";
import { Auctions } from "../types";
import { apiService } from "./helpers/api";
import { ensureFund, ensureParachain, getLatestCrowdloanId, getOrCreate, isFundAddress } from "./helpers/common";
import { getParachainId } from "./helpers/utils";

export async function handleAuctionStarted({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
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
  // auction.createdAt = new Date(block.timestamp);
  auction.closingStart = auctionEnds.toNumber();
  auction.ongoing = true;
  auction.closingEnd = auctionEnds.toNumber() + endingPeriod;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, "ChronicleKey");
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);
}

export async function handleAuctionClosed({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.log(" reached here ");
  const [auctionId] = new Auctions.AuctionClosedEvent(event).params;
  const auction = await getOrCreate(store, Auction, auctionId.toString());

  auction.blockNum = block.height;
  auction.status = "Closed";
  auction.ongoing = false;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, "ChronicleKey");
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);
}

export async function handleBidAccepted({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  
  const { timestamp: createdAt } = block;
  const [from, paraId, amount, firstSlot, lastSlot] =
    new Auctions.BidAcceptedEvent(event).params;
  let api = await apiService();
  const auctionId = (
    await api.query.auctions.auctionCounter()
  ).toJSON() as number;

  // const auction = await store.get(Auction, {
  //   where: { id: auctionId.toString() },
  // })

  const auction = await getOrCreate(store, Auction, auctionId.toString());
  const parachainId = (await getParachainId(paraId.toNumber())) as any;
  const parachain = await ensureParachain(paraId.toNumber(), store);
  const fund = await ensureFund(paraId.toNumber(), store);
  const blockNum = block.height;
  const isFund = await isFundAddress(from.toHex());
  const fundIdAlpha = await getLatestCrowdloanId(paraId.toString(), store);

  const bid = new Bid({
    id: `${blockNum}-${from}-${paraId}-${firstSlot}-${lastSlot}`,
    auction,
    blockNum,
    winningAuction: auctionId,
    parachain,
    isCrowdloan: isFund,
    amount: BigInt(amount.toString()),
    firstSlot: firstSlot.toNumber(),
    lastSlot: lastSlot.toNumber(),
    createdAt: new Date(createdAt),
    fund,
    bidder: isFund ? null : from.toHex(),
  });

  /**
   * ToDo: Getting error :-
            name: QueryFailedError, message: insert or update on table "bid" violates foreign key constraint "FK_9e594e5a61c0f3cb25679f6ba8d", 
            stack: QueryFailedError: insert or update on table "bid" violates foreign key constraint "FK_9e594e5a61c0f3cb25679f6ba8d"
   *  */ 
  await store.save(bid);

  const auctionParaId = `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`;
  const auctionPara = await store.get(AuctionParachain,{
    where: { auctionParaId }
  });
  if (!auctionPara) {
    await store.save(new AuctionParachain({
      id: auctionParaId,
      firstSlot: firstSlot.toNumber(),
      lastSlot: lastSlot.toNumber(),
      createdAt: new Date(block.timestamp),
      blockNum: block.height
    }))
  }
}

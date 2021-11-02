import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common';
import {   Auction, AuctionParachain, Bid, Chronicle, Crowdloan } from '../generated/model';
import { Auctions } from '../types';
import { apiService  } from './helpers/api';
import { getLatestCrowdloanId, getOrCreate, isFundAddress } from './helpers/common';


export async function handleAuctionStarted({
  store,
  event,
  block,
  extrinsic
}: EventContext & StoreContext): Promise<void> {

  const [auctionId, slotStart, auctionEnds] = new Auctions.AuctionStartedEvent(event).params;

  let api = await apiService();
  const endingPeriod = api.consts.auctions.endingPeriod.toJSON() as number;
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  const periods = api.consts.auctions.leasePeriodsPerSlot.toJSON() as number;

  const auction = await getOrCreate(store, Auction, auctionId.toString());

  auction.blockNum = block.height;
  auction.status = 'Started';
  auction.slotsStart = slotStart.toNumber();
  auction.slotsEnd = slotStart.toNumber() + periods - 1;
  auction.leaseStart = slotStart.toNumber() * leasePeriod;
  auction.leaseEnd = (slotStart.toNumber() + periods - 1) * leasePeriod;
  // auction.createdAt = new Date(block.timestamp);
  auction.closingStart = auctionEnds.toNumber();
  auction.ongoing = true;
  auction.closingEnd = auctionEnds.toNumber() + endingPeriod;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, 'ChronicleKey');
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);
};


export async function handleAuctionClosed({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
console.log(" reached here ")
  const [auctionId] = new Auctions.AuctionClosedEvent(event).params;
  const auction = await getOrCreate(store, Auction, auctionId.toString());

  auction.blockNum = block.height;
  auction.status = 'Closed';
  auction.ongoing = false;
  await store.save(auction);

  const chronicle = await getOrCreate(store, Chronicle, 'ChronicleKey');
  chronicle.curAuctionId = auctionId.toString();
  await store.save(chronicle);
};



// export async function handleBidAccepted({
//   store,
//   event,
//   block,
// }: EventContext & StoreContext): Promise<void> {

//   const [bidderId, paraId, bidAmount, startSlot, endSlot] = new Auctions.BidAcceptedEvent(event).params;
//   let api = await apiService();
//   const auctionId = (await api.query.auctions.auctionCounter()).toJSON() as number;
//   const isFund = isFundAddress(bidderId.toHex()) as unknown as boolean;
//   const bid = await getOrCreate(store, Bid, `${block.height}-${bidderId}-${paraId}-${startSlot}-${endSlot}`);

//   const fundId = await getLatestCrowdloanId(paraId.toString(), store);

//   bid.id = `${block.height}-${bidderId}-${paraId}-${startSlot}-${endSlot}`;
// ToDo: how do I get this auctionId
//   bid.auction.id = auctionId.toString();
//   bid.blockNum = block.height;
//   bid.winningAuction = auctionId;
//   bid.parachain.id = paraId.toString();
//   bid.isCrowdloan = isFund;
//   bid.amount = BigInt(bidAmount.toNumber());
//   bid.firstSlot = startSlot.toNumber();
//   bid.lastSlot = endSlot.toNumber();
//   bid.createdAt = new Date(block.timestamp);
//   // bid.fund.id = isFund ? fundId : '';
//   bid.bidder = isFund ? '' : bidderId.toHex();

//   await store.save(bid);

//   const auctionParaId = `${paraId}-${startSlot}-${endSlot}-${auctionId}`;
//   let auctionPara = await store.get(AuctionParachain,{
//     where: { id: auctionParaId.toString() }
//   });

//   // const shal = await store.find(AuctionParachain, {
//   //   where: { id: auctionParaId.toString() }, take: 1
//   //     })
//   let createdPara 
//   if (!auctionPara) {
//     createdPara = await store.save(new AuctionParachain({
//       id: auctionParaId,
//       firstSlot: startSlot.toNumber(),
//       lastSlot: endSlot.toNumber(),
//       createdAt: new Date(block.timestamp),
//       blockNum: block.height
//     }))
//   }
//   console.log(" createdPara ::: ",createdPara)
  
// };
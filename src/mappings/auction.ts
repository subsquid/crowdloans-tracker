import { DatabaseManager, EventContext, StoreContext } from '@subsquid/hydra-common';
import {   Auction, Chronicle, Crowdloan } from '../generated/model';
import { Auctions } from '../types';
import { apiService  } from './helpers/api';
import { getOrCreate } from './helpers/common';


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

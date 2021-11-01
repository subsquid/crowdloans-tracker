import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { IgnoreParachainIds } from "../constants";
import { Auction, Chronicle, Crowdloan, ParachainLeases } from "../generated/model";
import { Slots } from "../types";
import { apiService } from "./helpers/api";
import { ensureFund, ensureParachain, getOrCreate, getOrUpdate, isFundAddress } from "./helpers/common";
import { CrowdloanStatus } from "./helpers/types";
import { parseNumber } from "./helpers/utils";

// export async function handleLeasedSlot({
//   store,
//   event,
//   block,
//   extrinsic
// }: EventContext & StoreContext): Promise<void> {
//   const { method, section } = event;
//   const blockNum = block.height;
//   const [paraId, from, firstLease, leaseCount, extra, total] = new Slots.LeasedEvent(event).params;

//   const lastLease = firstLease.toNumber() + leaseCount.toNumber() - 1;

//   if (IgnoreParachainIds.includes(paraId.toNumber())) {
//     console.info(`Ignore testing parachain ${paraId}`);
//     return;
//   }

//   const { id: parachainId } = await ensureParachain(paraId.toNumber(), store);
//   const totalUsed = parseNumber(total.toString())
//   const extraAmount = parseNumber(extra.toString())
//   console.info(
//     `Slot leased, with ${JSON.stringify({ paraId, from, firstLease, lastLease, extra, total, parachainId }, null, 2)}`
//   );

//   const [ongoingAuction] = await store.find(Auction, {
//     where: { ongoing: true }, take: 1
//   })
  
//   const curAuction = ongoingAuction || { id: 'unknown', resultBlock: blockNum, leaseEnd: null };

//   if (curAuction.id === 'unknown') {
//     console.info('No active auction found, sudo or system parachain, upsert unknown Auction');
//     await getOrUpdate(store, Auction, 'unknown' ,{
//       id: 'unknown',
//       blockNum,
//       status: 'Closed',
//       slotsStart: 0,
//       slotsEnd: 0,
//       closingStart: 0,
//       closingEnd: 0,
//       ongoing: false
//     })
//   }
  
// const fundAddress = await isFundAddress(from.toString())
//   console.info(`handleSlotsLeased isFundAddress - from: ${from} - ${fundAddress}`);
//   if (fundAddress) {
//     console.info(`handleSlotsLeased update - parachain ${paraId} from Started to Won status`);
//     await ensureFund(paraId.toNumber(),store, {
//       status: CrowdloanStatus.WON,
//       wonAuctionId: curAuction.id,
//       leaseExpiredBlock: curAuction.leaseEnd
//     }).catch((err) => {
//       console.error(`Upsert Crowdloan failed ${err}`);
//     });
//   }

//   const { id: auctionId, resultBlock } = curAuction;
//   console.info(`Resolved auction id ${curAuction.id}, resultBlock: ${curAuction.id}, ${curAuction.resultBlock}`);
//   await getOrUpdate(store,ParachainLeases, `${paraId}-${auctionId || 'sudo'}-${firstLease}-${lastLease}`,{
//     paraId,
//     leaseRange: `${auctionId || 'sudo'}-${firstLease}-${lastLease}`,
//     firstLease,
//     lastLease,
//     latestBidAmount: totalUsed,
//     auctionId,
//     activeForAuction: auctionId || 'sudo',
//     parachainId,
//     extraAmount,
//     winningAmount: totalUsed,
//     wonBidFrom: from,
//     winningResultBlock: resultBlock,
//     hasWon: true
//   } ).catch((err) => {
//     console.error(`Upsert ParachainLeases failed ${err}`);
//   });
// };


export async function handleNewLeasePeriod({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  const [leaseIdx] = new Slots.NewLeasePeriodEvent(event).params;
  const api = await apiService();
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  
  let chronicle = await getOrCreate(store, Chronicle, 'ChronicleKey');

  const timestamp: number = Math.round(block.timestamp / 1000);
  chronicle.curLease = leaseIdx.toNumber();
  chronicle.curLeaseStart = timestamp;
  chronicle.curLeaseEnd = timestamp + leasePeriod - 1;

  await store.save(chronicle);
};
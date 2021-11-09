import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { ChronicleKey, IgnoreParachainIds } from "../constants";
import { Auction, Chronicle, Parachain, ParachainLeases } from "../generated/model";
import { Slots } from "../types";
import { apiService } from "./helpers/api";
import { ensureFund, ensureParachain, getOrCreate, getOrUpdate, isFundAddress } from "./helpers/common";
import { CrowdloanStatus } from "../constants";
import { parseNumber } from "./helpers/utils";

//reviewed
export async function handleSlotsLeased({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Slots] [Leased] Event Started.`);

  const blockNum = block.height;
  const [paraId, from, firstLease, leaseCount, extra, total] = new Slots.LeasedEvent(event).params;
  const lastLease = firstLease.toNumber() + leaseCount.toNumber() - 1;

  if (IgnoreParachainIds.includes(paraId.toNumber())) {
    console.info(`Ignore testing parachain ${paraId}`);
    return;
  }

  const { id: parachainId } = await ensureParachain(paraId.toNumber(), store, block);
  const totalUsed = parseNumber(total.toString());
  const extraAmount = parseNumber(extra.toString());

  const [ongoingAuction] = await store.find(Auction, {
    where: { ongoing: true },
    take: 1,
  });

  const curAuction = ongoingAuction || {
    id: "unknown",
    resultBlock: blockNum,
    leaseEnd: null,
  };

  if (curAuction.id === "unknown") {
    console.info("No active auction found, sudo or system parachain, upsert unknown Auction");
    await getOrUpdate(store, Auction, "unknown", {
      id: "unknown",
      blockNum,
      status: "Closed",
      slotsStart: 0,
      slotsEnd: 0,
      closingStart: 0,
      closingEnd: 0,
      ongoing: false,
    });
  }

  const fundAddress = await isFundAddress(from.toString());
  console.info(`handleSlotsLeased isFundAddress - from: ${from} - ${fundAddress}`);

  if (fundAddress) {
    console.info(`handleSlotsLeased update - parachain ${paraId} from Started to Won status`);
    await ensureFund(paraId.toNumber(), store,block, {
      status: CrowdloanStatus.WON,
      wonAuctionId: curAuction.id,
      leaseExpiredBlock: curAuction.leaseEnd,
    }).catch((err) => {
      console.error(`Upsert Crowdloan failed ${err}`);
    });
  }

  const { id: auctionId, resultBlock } = curAuction;

  const parachain = await store.find(Parachain, {
    where: { id: parachainId },
    take: 1,
  });

  const auction = await store.find(Auction, {
    where: { id: auctionId },
    take: 1,
  });

  console.info(`Resolved auction id ${curAuction.id}, resultBlock: ${curAuction.id}, ${curAuction.resultBlock}`);

  await getOrUpdate( store, ParachainLeases, `${paraId}-${auctionId || "sudo"}-${firstLease}-${lastLease}`,
   {
      // id: `${paraId}-${firstLease}-${lastLease}-${auctionId || "sudo"}`,
      paraId,
      parachain: parachain[0],
      leaseRange: `${auctionId || "sudo"}-${firstLease}-${lastLease}`,
      firstLease: firstLease.toNumber(),
      lastLease,
      latestBidAmount: BigInt(totalUsed),
      auction: auction[0],
      activeForAuction: auctionId || "sudo",
      parachainId,
      extraAmount: BigInt(extraAmount),
      winningAmount: BigInt(totalUsed),
      wonBidFrom: from.toString(),
      winningResultBlock: resultBlock,
      hasWon: true,
    }).catch((err) => {
    console.error(`Upsert ParachainLeases failed ${err}`);
  });

  console.info(` ------ [Slots] [Leased] Event Completed.`);
}

// Finished Review
export async function handleNewLeasePeriod({
  store,
  event,
  block,
}: EventContext & StoreContext): Promise<void> {
  console.info(` ------ [Slots] [NewLeasePeriod] Event Started.`);

  const [leaseIdx] = new Slots.NewLeasePeriodEvent(event).params;
  const api = await apiService();
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  const timestamp: number = Math.round(block.timestamp / 1000);
  let newValue = {
curLease: leaseIdx.toNumber(),
curLeaseStart: timestamp,
curLeaseEnd: timestamp + leasePeriod - 1
}

  await getOrUpdate(store,Chronicle,ChronicleKey,newValue)
  console.info(` ------ [Slots] [NewLeasePeriod] Event Completed.`);
}
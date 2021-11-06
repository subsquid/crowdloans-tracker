import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { IgnoreParachainIds, CrowdloanStatus } from "../constants";
import { Auction, Parachain, ParachainLeases } from "../generated/model";
import { Slots } from "../types";
import { ensureFund, ensureParachain, getAuctionsByOngoing, getOrUpdate } from "./helpers/common";
import { parseNumber, isFundAddress } from "./helpers/utils";

export async function handleSlotsLeased({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {
  const blockNum = block.height;
  const [paraId, from, firstLease, leaseCount, extra, total] =
    new Slots.LeasedEvent(event).params;

  const lastLease = firstLease.toNumber() + leaseCount.toNumber() - 1;

  if (IgnoreParachainIds.includes(paraId.toNumber())) {
    console.info(`Ignore testing parachain ${paraId}`);
    return;
  }

  const { id: parachainId } = await ensureParachain(paraId.toNumber(), store);

  const totalUsed = parseNumber(total.toString());
  const extraAmount = parseNumber(extra.toString());

  console.info(`Slot leased, with ${JSON.stringify({ paraId, from, firstLease, lastLease, extra, total, parachainId }, null, 2)}`);

  const [ongoingAuction] = await getAuctionsByOngoing(store, true) as any;
  const curAuction = ongoingAuction || { id: "unknown",
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

  console.info( `handleSlotsLeased isFundAddress - from: ${from} - ${fundAddress}`);
  if (fundAddress) {
    console.info(`handleSlotsLeased update - parachain ${paraId} from Started to Won status`);
    await ensureFund(paraId.toNumber(), store, {
      status: CrowdloanStatus.WON,
      wonAuctionId: curAuction.id,
      leaseExpiredBlock: curAuction.leaseEnd
    }).catch((err: any) => {
      console.error(`Upsert Crowdloan failed ${err}`);
    });
  }

  const { id: auctionId, resultBlock } = curAuction;
  console.info(
    `Resolved auction id ${curAuction.id}, resultBlock: ${curAuction.id}, ${curAuction.resultBlock}`
  );

  const parachain = await store.find(Parachain, {
    where: { id: parachainId },
    take: 1,
  });

  const auction = await store.find(Auction, {
    where: { id: auctionId },
    take: 1,
  });


  await getOrUpdate(store, ParachainLeases, `${paraId}-${auctionId || 'sudo'}-${firstLease}-${lastLease}`,{
    id: `${paraId}-${firstLease}-${lastLease}-${auctionId || 'sudo'}`,
    paraId,
    parachain: parachain[0],
    leaseRange: `${auctionId || 'sudo'}-${firstLease}-${lastLease}`,
    firstLease: firstLease.toNumber(),
    lastLease,
    latestBidAmount: BigInt(totalUsed),
    auction: auction[0],
    activeForAuction: auctionId || 'sudo',
    parachainId,
    extraAmount: BigInt(extraAmount),
    winningAmount: BigInt(totalUsed),
    wonBidFrom: from.toString(),
    winningResultBlock: resultBlock,
    hasWon: true
  } ).catch((err: any) => {
    console.error(`Upsert ParachainLeases failed ${err}`);
  });
}


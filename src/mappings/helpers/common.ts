import { DatabaseManager } from "@subsquid/hydra-common";
import { Entity } from "@subsquid/openreader/dist/model";
import { CrowdloanStatus } from "../../constants";
import {
  Auction,
  AuctionParachain,
  Bid,
  Crowdloan,
  CrowdloanSequence,
  Parachain,
  ParachainLeases,
} from "../../generated/model";
import { apiService } from "./api";
import { CrowdloanReturn, ParachainReturn } from "./types";
import {
  fetchCrowdloan,
  getParachainId,
  parseBigInt,
  parseNumber,
} from "./utils";

type EntityConstructor<T> = {
  new (...args: any[]): T;
};
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

export async function getOrCreate<T extends { id: string }>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {
  let e = await store.get(entityConstructor, {
    where: { id },
  });

  if (e == null) {
    e = new entityConstructor();
    e.id = id;
  }

  return e;
}

export const getOrUpdate = async <T>(
  store: DatabaseManager,
  entityConstructor: EntityConstructor<T>,
  id: string,
  newValues: Record<string, any>,
  updateFn?: (entry?: T) => Omit<T, "save">
): Promise<T> => {
  let e: any = await store.get(entityConstructor, {
    where: { id },
  });
  // if(!e){
  //   e = new entityConstructor({id})
  // }
  const updatedItem = e
    ? updateFn
      ? updateFn(e)
      : { ...e, ...newValues, id }
    : updateFn
    ? updateFn()
    : { ...newValues, id };
  e = e || new entityConstructor({ id });
  for (const property in updatedItem) {
    e[property] = updatedItem[property];
  }

  await store.save(e);
  return e;
};

/**
 * @shalabh add description
 * @param address
 * @returns
 */
export const isFundAddress = async (address: string) => {
  let api = await apiService();
  const hexStr = api.createType("Address", address).toHex();
  return Buffer.from(hexStr.slice(4, 28), "hex")
    .toString()
    .startsWith("modlpy/cfund");
};

export const fetchParachain = async (
  paraId: number
): Promise<ParachainReturn | null> => {
  const api = await apiService();
  const parachain = (await api.query.registrar.paras(paraId)).toJSON() as unknown;

  return parachain as ParachainReturn | null;
};

export const ensureParachain = async (
  paraId: number,
  store: DatabaseManager
): Promise<Parachain> => {
  const { manager, deposit } = (await fetchParachain(paraId)) || {
    manager: "",
    deposit: "",
  };
  const parachainId = `${paraId}-${manager}`;
  return await getOrUpdate<Parachain>(store, Parachain, parachainId, {
    id: parachainId,
    paraId,
    manager,
    deposit,
    deregistered: false,
  });
};

export const getIsReCreateCrowdloan = async (
  fundId: string,
  store: DatabaseManager
): Promise<Boolean> => {
  const [fund] = await await store.find(Crowdloan, {
    where: { id: fundId },
  });
  const isReCreateCrowdloan = !!(
    fund?.dissolvedBlock &&
    fund?.status === CrowdloanStatus.DISSOLVED &&
    fund?.isFinished
  );

  return isReCreateCrowdloan;
};

export const getLatestCrowdloanId = async (
  parachainId: string,
  store: DatabaseManager
) => {
  const api = await apiService();
  const [seq] = await store.find(CrowdloanSequence, {
    where: { id: parachainId },
  });
  const curBlockNum = await api.query.system.number();
  if (seq) {
    const crowdloanIdx = seq.curIndex;
    const isReCreateCrowdloan = await getIsReCreateCrowdloan(
      `${parachainId}-${crowdloanIdx}`,
      store
    );
    let curIdex = crowdloanIdx;
    if (isReCreateCrowdloan) {
      curIdex = crowdloanIdx + 1;
      seq.curIndex = curIdex;
      seq.blockNum = curBlockNum.toNumber();
      await store.save(seq);
    }

    return `${parachainId}-${curIdex}`;
  }

  const crowdloan = new CrowdloanSequence({
    id: parachainId,
    curIndex: 0,
    createdAt: new Date(),
    blockNum: curBlockNum.toNumber(),
  });
  await store.save(crowdloan);
  return `${parachainId}-0`;
};

export const ensureFund = async (
  paraId: number,
  store: DatabaseManager,
  modifier?: Record<string, any>
): Promise<Crowdloan> => {
  const fund = await fetchCrowdloan(paraId);
  const parachainId = await getParachainId(paraId);
  const parachain = await store.find(Parachain, {
    where: { id: parachainId },
    take: 1,
  });

  const fundId = await getLatestCrowdloanId(parachainId, store);
  const {
    cap,
    end,
    trieIndex,
    raised,
    lastContribution,
    firstPeriod,
    lastPeriod,
    ...rest
  } = fund || ({} as CrowdloanReturn);

  const test: any = null;

  return getOrUpdate<Crowdloan>(store, Crowdloan, fundId, test, (cur: any) => {
    return !cur
      ? new Crowdloan({
          id: fundId,
          parachain: parachain[0],
          ...rest,
          firstSlot: firstPeriod,
          lastSlot: lastPeriod,
          status: CrowdloanStatus.STARTED,
          raised: parseNumber(raised) as unknown as bigint,
          cap: parseNumber(cap) as unknown as bigint,
          lockExpiredBlock: end,
          isFinished: false,
          ...modifier,
        })
      : new Crowdloan({
          ...cur,
          raised:
            raised === undefined
              ? (parseBigInt(cur.raised) as unknown as bigint)
              : (parseNumber(raised) as unknown as bigint),
          cap:
            cap === undefined
              ? (parseBigInt(cur.cap) as unknown as bigint)
              : (parseNumber(cap) as unknown as bigint),
          ...modifier,
        });
  });
};

export const getAuctionsByOngoing = async (
  store: DatabaseManager,
  ongoing: boolean
): Promise<Auction[] | undefined> => {
  const records = await store.find(Auction, {
    where: { ongoing: true },
    take: 1,
  });
  return records.map((record) => create(record, Auction)) as Auction[];
};

export const getByLeaseRange = async (store: DatabaseManager, leaseRange: string): Promise<ParachainLeases[] | undefined> => {
  const records = await store.find(ParachainLeases, {
    where: { leaseRange },
    take: 1,
  });

  return records.map((record: any )=> create(record, ParachainLeases));
}

export const getByWinningAuction = async (store: DatabaseManager, winningAuction: number): Promise<Bid[] | undefined> => {
  const records = await store.find(Bid, {
    where: { winningAuction },
    take: 1,
  });

  return records.map((record: any )=> create(record, Bid));
}

export const getByAuctionParachain = async (store: DatabaseManager, id:string): Promise<AuctionParachain[] | undefined> => {
  const records = await store.find(AuctionParachain, {
    where: { id },
    take: 1,
  });

  return records.map((record: any ) => create(record, AuctionParachain));
}

export const getByAuctions = async (store: DatabaseManager, id:string): Promise<Auction[] | undefined> => {
  const records = await store.find(Auction, {
    where: { id },
    take: 1,
  });

  if (records){
    return records.map((record: any ) => create(record, Auction));
  }else{
      return;
  }
}

export const create = <T>(record: any, entityConstructor: EntityConstructor<T>) => {
  let entity = new entityConstructor(record.id);
  Object.assign(entity, record);

  return entity;
};


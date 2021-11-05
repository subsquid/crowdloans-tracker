import { DatabaseManager } from "@subsquid/hydra-common";
import { Entity } from "@subsquid/openreader/dist/model";
import { Crowdloan, CrowdloanSequence, Parachain } from "../../generated/model";
import { apiService } from "./api";
import { CrowdloanReturn, CrowdloanStatus, ParachainReturn } from "./types";
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
  const parachain = (
    await api.query.registrar.paras(paraId)
  ).toJSON() as unknown;
  console.info(
    `Fetched parachain ${paraId}: ${JSON.stringify(parachain, null, 2)}`
  );
  return parachain as ParachainReturn | null;
};

export const ensureParachain = async (
  paraId: number,
  store: DatabaseManager
): Promise<Parachain> => {
  console.info(`Fetch parachain by ${paraId}`);
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
  // console.info(` =======
  // Crowdloan: ${fundId} - DissolveBlock: ${fund?.dissolvedBlock} - Status: ${fund?.status} re-create crowdloan: ${isReCreateCrowdloan}
  // ======`);
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

    console.info(`Crowdloan: ${parachainId} fundId curIndex: ${curIdex}`);
    return `${parachainId}-${curIdex}`;
  }

  const crowdloan = new CrowdloanSequence({
    id: parachainId,
    curIndex: 0,
    createdAt: new Date(),
    blockNum: curBlockNum.toNumber(),
  });
  await store.save(crowdloan);
  console.info(`Crowdloan: ${parachainId} fundId: 0`);
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
  // console.info(`Retrieved parachainId: ${parachainId} for paraId: ${paraId}`);
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
  // console.info(
  //   `Fund detail: ${JSON.stringify(
  //     fund,
  //     null,
  //     2
  //   )} - cap: ${cap} - raised: ${raised}`
  // );
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

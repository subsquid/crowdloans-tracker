import { apiService } from './api';
import { CrowdloanReturn, ParachainReturn } from './types';

export const parseNumber = (hexOrNum: string | number | undefined): number => {
  if (!hexOrNum) {
    return 0;
  }
  return typeof hexOrNum === 'string' ? parseInt(hexOrNum.replace(/^0x/, ''), 16) || 0 : hexOrNum;
};

export const parseBigInt = (data:any) => {
  if (data !== undefined) {
    return JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? `${v}#bigint` : v)).replace(
      /"(-?\d+)#bigint"/g,
      (_, a) => a
    );
  }
  return 0;
};

export const getParachainId = async (paraId: number | ParachainReturn) => {
  if (typeof paraId === 'number') {
    const { manager } = (await fetchParachain(paraId)) || {};
    return `${paraId}-${manager || ''}`;
  }
  const { manager } = paraId || {};
  return `${paraId}-${manager || ''}`;
};

export const fetchParachain = async (paraId: number): Promise<ParachainReturn | null> => {
    const api =await  apiService();
  const parachain = (await api.query.registrar.paras(paraId)).toJSON() as unknown;
  console.info(`Fetched parachain ${paraId}: ${JSON.stringify(parachain, null, 2)}`);
  return parachain as ParachainReturn | null;
};

export const fetchCrowdloan = async (paraId: number): Promise<CrowdloanReturn | null> => {
  const api = await  apiService();
  const fund = await api.query.crowdloan.funds(paraId);
  console.info(`Fetched crowloan ${paraId}: ${JSON.stringify(fund, null, 2)}`);
  return fund.toJSON() as unknown as CrowdloanReturn | null;
};

export const isFundAddress = async (address: string) => {
    const api = await  apiService();
  const hexStr = api.createType('Address', address).toHex();
  return Buffer.from(hexStr.slice(4, 28), 'hex').toString().startsWith('modlpy/cfund');
};

export const getParachainIndex = async (address: string) => {
    const api = await  apiService();
  const hexStr:any = api.createType('Address', address).toHex();
  const hexIndexLE = '0x' + hexStr.slice(28, 32).match(/../g).reverse().join('');
  return parseInt(hexIndexLE, 10);
};
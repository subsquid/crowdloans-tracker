import { Crowdloan } from '../../generated/model';

type HexNumber = string;

export interface ParachainReturn {
  manager: string;
  deposit: number;
}

export interface CrowdloanReturn {
  retiring: boolean;
  depositor: string;
  verifier: null | string;
  deposit: number;
  raised: HexNumber;
  end: number;
  cap: HexNumber;
  lastContribution: {
    preEnding?: number[];
    ending: number[];
    never?: null;
  };
  firstPeriod: number;
  lastPeriod: number;
  trieIndex: number;
}

export type CrowdloanUpdater = keyof Crowdloan;
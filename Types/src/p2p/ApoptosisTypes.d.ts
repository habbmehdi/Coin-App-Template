import { SignedObject } from './P2PTypes';
/** TYPES */
interface ApoptosisProposal {
    id: string;
    when: number;
}
export declare type SignedApoptosisProposal = ApoptosisProposal & SignedObject;
export interface Txs {
    apoptosis: SignedApoptosisProposal[];
}
export interface Record {
    apoptosized: string[];
}
export {};

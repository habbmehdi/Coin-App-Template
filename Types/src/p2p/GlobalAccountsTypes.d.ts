import { NodeInfo, Signature, SignedObject } from './P2PTypes';
/** TYPES */
export interface SetGlobalTx {
    address: string;
    value: unknown;
    when: number;
    source: string;
}
export interface Receipt {
    signs: Signature[];
    tx: SetGlobalTx;
    consensusGroup: Set<NodeInfo['id']>;
}
export interface Tracker {
    seen: Set<NodeInfo['publicKey']>;
    timestamp: number;
    gossiped: boolean;
}
export declare type TxHash = string;
export declare type SignedSetGlobalTx = SetGlobalTx & SignedObject;

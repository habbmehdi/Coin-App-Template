import * as shardFunctionTypes from '../state-manager/shardFunctionTypes';
import { CycleRecord } from './CycleCreatorTypes';
/** TYPES */
export interface StateMetaData {
    counter: CycleRecord['counter'];
    stateHashes: StateHashes[];
    receiptHashes: ReceiptHashes[];
    summaryHashes: SummaryHashes[];
}
export declare type ValidTypes = CycleRecord | StateMetaData;
export declare enum TypeNames {
    CYCLE = "CYCLE",
    STATE_METADATA = "STATE_METADATA"
}
export interface NamesToTypes {
    CYCLE: CycleRecord;
    STATE_METADATA: StateMetaData;
}
export declare type TypeName<T extends ValidTypes> = T extends CycleRecord ? TypeNames.CYCLE : TypeNames.STATE_METADATA;
export declare type TypeIndex<T extends ValidTypes> = T extends CycleRecord ? CycleRecord['counter'] : StateMetaData['counter'];
export interface NetworkHash {
    cycle: number;
    hash: string;
}
export interface StateHashes {
    counter: CycleRecord['counter'];
    partitionHashes: object;
    networkHash: NetworkStateHash;
}
export interface ReceiptHashes {
    counter: CycleRecord['counter'];
    receiptMapHashes: object;
    networkReceiptHash: NetworkReceiptHash;
}
export interface SummaryHashes {
    counter: CycleRecord['counter'];
    summaryHashes: object;
    networkSummaryHash: NetworkSummarytHash;
}
export interface Record {
    networkDataHash: NetworkHash[];
    networkReceiptHash: NetworkHash[];
    networkSummaryHash: NetworkHash[];
}
export declare type PartitionRanges = Map<shardFunctionTypes.AddressRange['partition'], shardFunctionTypes.AddressRange>;
export declare type PartitionHashes = Map<shardFunctionTypes.AddressRange['partition'], string>;
export declare type ReceiptMapHashes = Map<shardFunctionTypes.AddressRange['partition'], string>;
export declare type NetworkStateHash = string;
export declare type NetworkReceiptHash = string;
export declare type NetworkSummarytHash = string;
export declare type PartitionNum = number;
export declare enum offerResponse {
    needed = "needed",
    notNeeded = "not_needed",
    tryLater = "try_later",
    sendTo = "send_to"
}

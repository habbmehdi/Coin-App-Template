import { ReceiptMapResult, SummaryBlob } from './StateManagerTypes';
export declare type CycleMarker = string;
export declare type StateData = {
    parentCycle?: CycleMarker;
    networkHash?: string;
    partitionHashes?: string[];
};
export declare type Receipt = {
    parentCycle?: CycleMarker;
    networkHash?: string;
    partitionHashes?: string[];
    partitionMaps?: {
        [partition: number]: ReceiptMapResult;
    };
    partitionTxs?: {
        [partition: number]: any;
    };
};
export declare type Summary = {
    parentCycle?: CycleMarker;
    networkHash?: string;
    partitionHashes?: string[];
    partitionBlobs?: {
        [partition: number]: SummaryBlob;
    };
};

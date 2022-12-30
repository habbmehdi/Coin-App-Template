export declare type ReceiptMap = {
    [txId: string]: string[];
};
export declare type ReceiptMapResult = {
    cycle: number;
    partition: number;
    receiptMap: ReceiptMap;
    txCount: number;
    txsMap: {
        [id: string]: any[];
    };
    txsMapEVMReceipt: {
        [id: string]: unknown;
    };
};
export declare type OpaqueBlob = any;
export declare type SummaryBlob = {
    latestCycle: number;
    counter: number;
    errorNull: number;
    partition: number;
    opaqueBlob: OpaqueBlob;
};
export declare type SummaryBlobCollection = {
    cycle: number;
    blobsByPartition: Map<number, SummaryBlob>;
};
export declare type StatsClump = {
    error: boolean;
    cycle: number;
    dataStats: SummaryBlob[];
    txStats: SummaryBlob[];
    covered: number[];
    coveredParititionCount: number;
    skippedParitionCount: number;
};

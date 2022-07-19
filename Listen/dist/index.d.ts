import Shardus from './shardus';
import * as ShardusTypes from './shardus/shardus-types';
export { default as Shardus } from './shardus';
export { ShardusTypes };
import { addressToPartition, partitionInWrappingRange, findHomeNode } from './state-manager/shardFunctions';
export declare const __ShardFunctions: {
    addressToPartition: typeof addressToPartition;
    partitionInWrappingRange: typeof partitionInWrappingRange;
    findHomeNode: typeof findHomeNode;
};
export declare function shardusFactory(configs?: {}): Shardus;

import * as Types from './P2PTypes';
/** TYPES */
export declare enum ScaleType {
    UP = "up",
    DOWN = "down"
}
export interface Record {
    desired: number;
}
export interface ScaleRequest {
    nodeId: string;
    timestamp: number;
    counter: number;
    scale: string;
}
export interface Txs {
    autoscaling: SignedScaleRequest[];
}
export declare type SignedScaleRequest = ScaleRequest & Types.SignedObject;

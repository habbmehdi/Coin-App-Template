import { SignedObject } from './P2PTypes';
/** TYPES */
export interface LostReport {
    target: string;
    checker: string;
    reporter: string;
    cycle: number;
    killother?: boolean;
}
interface DownGossipMessage {
    report: SignedLostReport;
    status: string;
    cycle: number;
}
interface UpGossipMessage {
    target: string;
    status: string;
    cycle: number;
}
export declare type SignedLostReport = LostReport & SignedObject;
export declare type SignedDownGossipMessage = DownGossipMessage & SignedObject;
export declare type SignedUpGossipMessage = UpGossipMessage & SignedObject;
export interface LostRecord {
    target: string;
    cycle: number;
    status: string;
    message?: any;
    gossiped?: boolean;
}
export interface Txs {
    lost: SignedDownGossipMessage[];
    refuted: SignedUpGossipMessage[];
}
export interface Record {
    lost: string[];
    lostSyncing: string[];
    refuted: string[];
}
export {};

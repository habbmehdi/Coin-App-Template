export interface LooseObject {
    [index: string]: unknown;
}
export interface Signature {
    owner: string;
    sig: string;
}
export interface SignedObject extends LooseObject {
    sign: Signature;
}
export declare enum NodeStatus {
    ACTIVE = "active",
    SYNCING = "syncing"
}
export interface P2PNode {
    publicKey: string;
    blsPublicKey: any;
    externalIp: string;
    externalPort: number;
    internalIp: string;
    internalPort: number;
    address: string;
    joinRequestTimestamp: number;
    activeTimestamp: number;
}
export interface Node {
    ip: string;
    port: number;
    publicKey: string;
}
export interface NodeInfo {
    curvePublicKey: string;
    externalIp: string;
    externalPort: number;
    id: string;
    internalIp: string;
    internalPort: number;
    publicKey: string;
    status: NodeStatus;
}
export interface Route<T> {
    method?: string;
    name: string;
    handler: T;
}
export declare type InternalHandler<Payload = unknown, Response = unknown, Sender = unknown> = (payload: Payload, respond: (response?: Response) => void, sender: Sender, tracker: string, msgSize: number) => void;
export declare type GossipHandler<Payload = unknown, Sender = unknown> = (payload: Payload, sender: Sender, tracker: string, msgSize: number) => void;

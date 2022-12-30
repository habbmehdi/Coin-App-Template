import { JoinedConsensor } from './JoinTypes';
import { NodeStatus } from './P2PTypes';
declare type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>;
export interface Node extends JoinedConsensor {
    curvePublicKey: string;
    status: NodeStatus;
}
export declare type Update = OptionalExceptFor<Node, 'id'>;
export {};

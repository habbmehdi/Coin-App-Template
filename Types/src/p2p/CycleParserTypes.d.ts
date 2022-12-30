import { JoinedConsensor } from './JoinTypes';
import { Node, Update } from './NodeListTypes';
export interface Change {
    added: JoinedConsensor[];
    removed: Array<Node['id']>;
    updated: Update[];
}

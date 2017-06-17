import Claim from './Claim.ts';
import Score from './score.ts';

export default class Dict<T> {
    [K: string]: T;
}

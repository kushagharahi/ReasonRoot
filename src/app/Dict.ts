import Claim from './Claim';
import Score from './score';

export default class Dict<T> {
    [K: string]: T;
}

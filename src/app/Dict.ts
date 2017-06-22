import Claim from './Claim';
import Score from './Score';

export default class Dict<T> {
    [K: string]: T;
}

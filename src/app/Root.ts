import Dict from './Dict';
import Claim from './Claim';
import Score from './score';

export default class Root {
    mainId: string;
    claims: Dict<Claim> = new Dict<Claim>();
    scores: Dict<Score> = new Dict<Score>();
    settings: any = {};
}

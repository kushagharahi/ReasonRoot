import Dict from './Dict.ts';
import Claim from './Claim.ts';
import Score from './score.ts';

export default class Root {
    mainId: string;
    claims: Dict<Claim> = new Dict<Claim>();
    scores: Dict<Score> = new Dict<Score>();
    settings: any = {};
}

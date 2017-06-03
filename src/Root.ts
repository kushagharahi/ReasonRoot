class Root {
    mainId: string;
    claims: Dict<Claim> = new Dict<Claim>();
    scores: Dict<Score> = new Dict<Score>();
    settings: any = {};
}
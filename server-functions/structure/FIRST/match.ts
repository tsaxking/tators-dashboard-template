import { TBA_AllianceColor, TBA_ComLevel } from "./enums"



type TBA_Alliance = {
    score: number,
    team_keys: string[],
    surrogate_team_keys: string[],
    dq_team_keys: string[]
}

type TBA_Video = {
    type: string,
    key: string
}

type TBA_Match = {
    key: string,
    comp_level: TBA_ComLevel,
    set_number: number,
    match_number: number,
    alliances: {
        red: TBA_Alliance,
        blue: TBA_Alliance
    },
    winning_alliance: TBA_AllianceColor,
    event_key: string,
    time: number,
    actual_time: number,
    predicted_time: number,
    post_result_time: number,
    score_breakdown: {},
    videos: TBA_Video[]
};


export class FIRSTMatch {
    info: TBA_Match;

    constructor(match: TBA_Match) {
        this.info = match;
    }
}
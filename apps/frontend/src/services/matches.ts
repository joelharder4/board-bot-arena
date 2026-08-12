import { type MatchListResponse, type MatchListParams, type ApiErrorResponse, type JoinMatchRequest, type JoinMatchResponse } from "@board-bot-arena/shared";
import { api } from "./api";
import axios from "axios";

export const getMatches = async (params: MatchListParams) => {
  try {
    const res = await api.get<MatchListResponse>('/matches', { params: params });
    return res.data;
  } catch(e) {
    if (axios.isAxiosError<ApiErrorResponse>(e)) {
      console.error("API Error: ", e.response?.data?.error);
    }
    throw e;
  }
}


export const joinMatch = async (payload: JoinMatchRequest): Promise<JoinMatchResponse> => {
  if (!payload.joinCode && !payload.matchId) throw new Error("Must include one of joinCode or matchId");

  try {
    const res = await api.post<JoinMatchResponse>('/matches/join', { payload });
    return res.data;
  } catch(e) {
    if (axios.isAxiosError<ApiErrorResponse>(e)) {
      console.error("API Error: ", e.response?.data?.error);
    }
    throw e;
  }
}
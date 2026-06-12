import { type MatchListResponse, type MatchListParams, type ApiErrorResponse } from "@board-bot-arena/shared";
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
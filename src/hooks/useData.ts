import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export const useData = () => {
  const { data, ...optoins } = useQuery({
    queryKey: ["DATA"],
    queryFn: () => api.get(`/get-data`),
  });
  return {
    data: data?.data ?? {},
    ...optoins,
  };
};

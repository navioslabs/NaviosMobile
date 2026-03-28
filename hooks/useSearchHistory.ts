import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@navios_search_history";
const MAX_ITEMS = 5;

/** 検索履歴を管理するフック */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v) setHistory(JSON.parse(v));
    });
  }, []);

  /** 検索ワードを履歴に追加（重複排除、最大5件） */
  const addHistory = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_ITEMS);
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [history]);

  /** 履歴をクリア */
  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addHistory, clearHistory };
}

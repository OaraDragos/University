import * as React from "react";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://URL-UL-TAU.supabase.co";
const supabaseKey = "CHEIA_TA_ANON";
const supabase = createClient(supabaseUrl, supabaseKey);

export const set = async (key: string, value: any): Promise<void> => {
  const { error } = await supabase.from("kv_store_19deb4c6").upsert({
    key,
    value,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const get = async (key: string): Promise<any> => {
  const { data, error } = await supabase
      .from("kv_store_19deb4c6")
      .select("value")
      .eq("key", key)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.value;
};

export const del = async (key: string): Promise<void> => {
  const { error } = await supabase
      .from("kv_store_19deb4c6")
      .delete()
      .eq("key", key);

  if (error) {
    throw new Error(error.message);
  }
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const rows = keys.map((k, i) => ({
    key: k,
    value: values[i],
  }));

  const { error } = await supabase.from("kv_store_19deb4c6").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
};

export const mget = async (keys: string[]): Promise<any[]> => {
  const { data, error } = await supabase
      .from("kv_store_19deb4c6")
      .select("key, value")
      .in("key", keys);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((item) => item.value) ?? [];
};

export const mdel = async (keys: string[]): Promise<void> => {
  const { error } = await supabase
      .from("kv_store_19deb4c6")
      .delete()
      .in("key", keys);

  if (error) {
    throw new Error(error.message);
  }
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const { data, error } = await supabase
      .from("kv_store_19deb4c6")
      .select("key, value")
      .like("key", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((item) => item.value) ?? [];
};
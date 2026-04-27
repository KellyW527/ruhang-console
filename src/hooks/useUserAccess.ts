/**
 * useUserAccess
 * ----------------------------------------------------------------
 * 会员/解锁权限的唯一前端入口。所有需要判断"用户能否进入某个项目"
 * 的地方都应该用 hasAccess(simulationCode)。
 *
 * 真实校验在数据库 RLS + has_simulation_access() 函数。前端这层只是
 * UI 体验（提前显示锁、隐藏按钮），不是安全边界。
 *
 * 数据来源：
 *   - subscriptions（active 那条）→ 配额、套餐档位、到期时间
 *   - user_entitlements → 已解锁的项目列表
 *   - 免费固定项目 ibd-ipo 始终返回 true
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const FREE_DEFAULT_SIMULATION = "ibd-ipo";

export type SubscriptionInfo = {
  id: string;
  tier: "basic" | "premium";
  status: string;
  quotaTotal: number;
  quotaUsed: number;
  quotaRemaining: number;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export type EntitlementRow = {
  simulation_code: string;
  source: "free_default" | "basic" | "premium" | "single_purchase";
  expires_at: string | null;
};

export function useUserAccess() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setEntitlements([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // 1) active subscription via RPC（容错：表/函数还没建好时静默降级）
    try {
      const { data: subRows } = await supabase.rpc("get_active_subscription", { _user_id: user.id });
      const row = Array.isArray(subRows) ? subRows[0] : null;
      if (row) {
        setSubscription({
          id: row.id,
          tier: row.tier,
          status: row.status,
          quotaTotal: row.quota_total,
          quotaUsed: row.quota_used,
          quotaRemaining: row.quota_remaining,
          currentPeriodEnd: row.current_period_end,
          cancelAtPeriodEnd: row.cancel_at_period_end,
        });
      } else {
        setSubscription(null);
      }
    } catch {
      setSubscription(null);
    }

    // 2) entitlements
    try {
      const { data } = await supabase
        .from("user_entitlements")
        .select("simulation_code, source, expires_at")
        .eq("user_id", user.id);
      setEntitlements((data ?? []) as EntitlementRow[]);
    } catch {
      setEntitlements([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * hasAccess(simulationCode)
   * 前端授权判断。规则与数据库 has_simulation_access() 保持一致。
   */
  const hasAccess = useMemo(() => {
    return (simulationCode: string): boolean => {
      if (!user) return false;
      if (simulationCode === FREE_DEFAULT_SIMULATION) return true;
      const now = Date.now();
      return entitlements.some((e) => {
        if (e.simulation_code !== simulationCode) return false;
        if (!e.expires_at) return true; // 单买永久
        const exp = new Date(e.expires_at).getTime();
        if (Number.isNaN(exp)) return false; // 脏数据当作未授权,避免误判
        return exp > now;
      });
    };
  }, [user, entitlements]);

  return {
    loading,
    subscription,
    entitlements,
    hasAccess,
    refresh,
    isFreeDefault: (code: string) => code === FREE_DEFAULT_SIMULATION,
  };
}

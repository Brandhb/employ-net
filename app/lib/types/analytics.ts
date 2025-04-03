// app/types/analytics.ts (server-only)
export type ActivityGroupByOutput = {
    title: string;
    metadata: any;
    type: string;
    status: string;
    _count: number;
    _sum: {
      points: number | null;
    };
  };
  
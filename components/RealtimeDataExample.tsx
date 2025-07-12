import React from "react";
import { useRealtimeData } from "../hooks/use-realtime-data";

export default function RealtimeDataExample() {
  // Change 'sample/path' to your actual database path
  const { data, loading, error } = useRealtimeData<any>("sensors/pm25");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Realtime Data from Firebase</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 
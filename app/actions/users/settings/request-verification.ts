export async function requestVerification(taskId: string, userId: string) {
    const response = await fetch("/api/verification/request", {
      method: "POST",
      body: JSON.stringify({ taskId, userId }),
    });
  
    return response.ok;
  }
  
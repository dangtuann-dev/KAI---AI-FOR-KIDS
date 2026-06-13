async function test() {
  try {
    console.log("Sending request to /api/tts...");
    const res = await fetch('http://localhost:3001/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "Chào bạn" })
    });
    console.log("Response status:", res.status);
    console.log("Content-Type:", res.headers.get('content-type'));
    console.log("Duration Estimate Ms:", res.headers.get('x-duration-estimate-ms'));
    if (!res.ok) {
      console.log("Error text:", await res.text());
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

test();

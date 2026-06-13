const { EdgeTTS } = require('edge-tts-universal');

async function test() {
  try {
    console.log("Starting Edge TTS synthesis test...");
    const tts = new EdgeTTS("Xin chào các bạn, mình là Kai", "vi-VN-NamMinhNeural", {
      rate: '+3%',
      pitch: '+0Hz',
      volume: '+0%',
    });
    const result = await tts.synthesize();
    console.log("Synthesis finished!");
    console.log("Subtitle count:", result.subtitle ? result.subtitle.length : 0);
    console.log("Buffer size:", result.audio ? result.audio.arrayBuffer ? (await result.audio.arrayBuffer()).byteLength : "no arrayBuffer" : "no audio");
  } catch (error) {
    console.error("Edge TTS synthesis failed with error:", error);
  }
}

test();

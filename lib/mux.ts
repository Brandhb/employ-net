import Mux from "@mux/mux-node";

// Use username and password instead of tokenId and tokenSecret
const mux = new Mux({
  auth: {
    username: process.env.MUX_TOKEN_ID as string,
    password: process.env.MUX_TOKEN_SECRET as string,
  },
});

const { Video } = mux;

export async function createMuxAsset(videoUrl: string) {
  try {
    const asset = await Video.Assets.create({
      input: videoUrl,
      playback_policy: "public",
    });

    return {
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
    };
  } catch (error) {
    console.error("Error creating Mux asset:", error);
    throw error;
  }
}

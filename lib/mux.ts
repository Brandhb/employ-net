import Mux from "@mux/mux-node";

const { Video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

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
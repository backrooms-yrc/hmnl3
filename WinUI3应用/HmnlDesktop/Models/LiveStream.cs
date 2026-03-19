using System.Text.Json.Serialization;

namespace HmnlDesktop.Models;

public class LiveStream
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("channel_id")]
    public string ChannelId { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("rtmp_url")]
    public string? RtmpUrl { get; set; }

    [JsonPropertyName("rtmp_key")]
    public string? RtmpKey { get; set; }

    [JsonPropertyName("m3u8_url")]
    public string? M3u8Url { get; set; }

    [JsonPropertyName("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("viewer_count")]
    public int ViewerCount { get; set; }

    [JsonPropertyName("is_live")]
    public bool IsLive { get; set; }

    [JsonPropertyName("started_at")]
    public DateTime? StartedAt { get; set; }

    [JsonPropertyName("ended_at")]
    public DateTime? EndedAt { get; set; }

    [JsonPropertyName("channel")]
    public Channel? Channel { get; set; }
}

public class LiveInteraction
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("channel_id")]
    public string ChannelId { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string? Content { get; set; }

    [JsonPropertyName("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}

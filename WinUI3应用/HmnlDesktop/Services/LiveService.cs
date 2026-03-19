using Microsoft.Extensions.Configuration;
using HmnlDesktop.Models;

namespace HmnlDesktop.Services;

public class LiveService
{
    private readonly ApiService _apiService;
    private readonly AuthService _authService;

    public LiveService(ApiService apiService, AuthService authService)
    {
        _apiService = apiService;
        _authService = authService;
    }

    public async Task<List<LiveStream>?> GetLiveStreamsAsync()
    {
        try
        {
            var response = await _apiService.GetAsync<List<LiveStream>>("/live-streams");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"获取直播列表失败: {ex.Message}", ex);
        }
    }

    public async Task<LiveStream?> GetLiveStreamAsync(string streamId)
    {
        try
        {
            var response = await _apiService.GetAsync<LiveStream>($"/live-streams/{streamId}");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"获取直播信息失败: {ex.Message}", ex);
        }
    }

    public async Task<LiveStream?> StartLiveStreamAsync(string channelId, string title, string? description = null)
    {
        try
        {
            var streamData = new { channel_id = channelId, title, description };
            var response = await _apiService.PostAsync<LiveStream>("/live-streams", streamData);
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"开始直播失败: {ex.Message}", ex);
        }
    }

    public async Task<bool> StopLiveStreamAsync(string streamId)
    {
        try
        {
            await _apiService.PutAsync<object>($"/live-streams/{streamId}/stop", new { });
            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"停止直播失败: {ex.Message}", ex);
        }
    }

    public async Task<List<LiveInteraction>?> GetInteractionsAsync(string channelId)
    {
        try
        {
            var response = await _apiService.GetAsync<List<LiveInteraction>>($"/live-interactions?channel_id={channelId}");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"获取互动信息失败: {ex.Message}", ex);
        }
    }

    public async Task<LiveInteraction?> CreateInteractionAsync(string channelId, string type, string title, string? content = null, DateTime? expiresAt = null)
    {
        try
        {
            var interactionData = new { channel_id = channelId, type, title, content, expires_at = expiresAt };
            var response = await _apiService.PostAsync<LiveInteraction>("/live-interactions", interactionData);
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"创建互动失败: {ex.Message}", ex);
        }
    }
}

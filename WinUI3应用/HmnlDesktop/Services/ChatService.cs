using Microsoft.Extensions.Configuration;
using HmnlDesktop.Models;

namespace HmnlDesktop.Services;

public class ChatService
{
    private readonly ApiService _apiService;
    private readonly AuthService _authService;

    public ChatService(ApiService apiService, AuthService authService)
    {
        _apiService = apiService;
        _authService = authService;
    }

    public async Task<List<Channel>?> GetChannelsAsync()
    {
        try
        {
            var response = await _apiService.GetAsync<List<Channel>>("/channels");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"获取频道列表失败: {ex.Message}", ex);
        }
    }

    public async Task<List<Message>?> GetMessagesAsync(string channelId, int limit = 50, int offset = 0)
    {
        try
        {
            var response = await _apiService.GetAsync<List<Message>>($"/channel-messages/{channelId}?limit={limit}&offset={offset}");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"获取消息失败: {ex.Message}", ex);
        }
    }

    public async Task<Message?> SendMessageAsync(string channelId, string content)
    {
        try
        {
            var message = new { channel_id = channelId, content };
            var response = await _apiService.PostAsync<Message>("/channel-messages", message);
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"发送消息失败: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteMessageAsync(string messageId)
    {
        try
        {
            await _apiService.DeleteAsync<object>($"/channel-messages/{messageId}");
            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"删除消息失败: {ex.Message}", ex);
        }
    }

    public async Task<List<Message>?> SearchMessagesAsync(string channelId, string query)
    {
        try
        {
            var response = await _apiService.GetAsync<List<Message>>($"/channel-messages/{channelId}/search?q={Uri.EscapeDataString(query)}");
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"搜索消息失败: {ex.Message}", ex);
        }
    }
}

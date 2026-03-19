using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class ChatViewModel : ObservableObject
{
    private readonly ChatService _chatService;
    private readonly AuthService _authService;

    [ObservableProperty]
    private ObservableCollection<Channel> _channels = new();

    [ObservableProperty]
    private ObservableCollection<Message> _messages = new();

    [ObservableProperty]
    private Channel? _selectedChannel;

    [ObservableProperty]
    private string _newMessage = string.Empty;

    [ObservableProperty]
    private string _searchQuery = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    public ChatViewModel(ChatService chatService, AuthService authService)
    {
        _chatService = chatService;
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoadChannelsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var channels = await _chatService.GetChannelsAsync();
            if (channels != null)
            {
                Channels.Clear();
                foreach (var channel in channels)
                {
                    Channels.Add(channel);
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task SelectChannelAsync(Channel? channel)
    {
        if (channel == null) return;

        SelectedChannel = channel;
        await LoadMessagesAsync(channel.Id);
    }

    [RelayCommand]
    private async Task LoadMessagesAsync(string channelId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var messages = await _chatService.GetMessagesAsync(channelId);
            if (messages != null)
            {
                Messages.Clear();
                foreach (var message in messages.OrderByDescending(m => m.CreatedAt))
                {
                    Messages.Add(message);
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task SendMessageAsync()
    {
        if (SelectedChannel == null || string.IsNullOrEmpty(NewMessage))
        {
            ErrorMessage = "请选择频道并输入消息";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var message = await _chatService.SendMessageAsync(SelectedChannel.Id, NewMessage);
            if (message != null)
            {
                Messages.Insert(0, message);
                NewMessage = string.Empty;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task SearchMessagesAsync()
    {
        if (SelectedChannel == null || string.IsNullOrEmpty(SearchQuery))
        {
            ErrorMessage = "请选择频道并输入搜索关键词";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var messages = await _chatService.SearchMessagesAsync(SelectedChannel.Id, SearchQuery);
            if (messages != null)
            {
                Messages.Clear();
                foreach (var message in messages.OrderByDescending(m => m.CreatedAt))
                {
                    Messages.Add(message);
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task DeleteMessageAsync(string messageId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            await _chatService.DeleteMessageAsync(messageId);
            var message = Messages.FirstOrDefault(m => m.Id == messageId);
            if (message != null)
            {
                Messages.Remove(message);
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }
}

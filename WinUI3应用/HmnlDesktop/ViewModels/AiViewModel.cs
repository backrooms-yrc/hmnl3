using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class AiViewModel : ObservableObject
{
    private readonly ApiService _apiService;
    private readonly AuthService _authService;

    [ObservableProperty]
    private ObservableCollection<AiConversation> _conversations = new();

    [ObservableProperty]
    private ObservableCollection<AiMessage> _messages = new();

    [ObservableProperty]
    private ObservableCollection<AiModel> _models = new();

    [ObservableProperty]
    private AiConversation? _selectedConversation;

    [ObservableProperty]
    private AiModel? _selectedModel;

    [ObservableProperty]
    private string _newMessage = string.Empty;

    [ObservableProperty]
    private string _conversationTitle = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    [ObservableProperty]
    private bool _isStreaming;

    public AiViewModel(ApiService apiService, AuthService authService)
    {
        _apiService = apiService;
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoadConversationsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var conversations = await _apiService.GetAsync<List<AiConversation>>("/ai-conversations");
            if (conversations != null)
            {
                Conversations.Clear();
                foreach (var conversation in conversations)
                {
                    Conversations.Add(conversation);
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
    private async Task LoadModelsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var models = await _apiService.GetAsync<List<AiModel>>("/ai-models");
            if (models != null)
            {
                Models.Clear();
                foreach (var model in models.Where(m => m.IsActive))
                {
                    Models.Add(model);
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
    private async Task SelectConversationAsync(AiConversation? conversation)
    {
        if (conversation == null) return;

        SelectedConversation = conversation;
        await LoadMessagesAsync(conversation.Id);
    }

    [RelayCommand]
    private async Task LoadMessagesAsync(string conversationId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var messages = await _apiService.GetAsync<List<AiMessage>>($"/ai-conversations/{conversationId}/messages");
            if (messages != null)
            {
                Messages.Clear();
                foreach (var message in messages.OrderBy(m => m.CreatedAt))
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
    private async Task CreateConversationAsync()
    {
        if (SelectedModel == null)
        {
            ErrorMessage = "请选择AI模型";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var conversationData = new
            {
                model_id = SelectedModel.Id,
                title = string.IsNullOrEmpty(ConversationTitle) ? "新对话" : ConversationTitle
            };

            var conversation = await _apiService.PostAsync<AiConversation>("/ai-conversations", conversationData);
            if (conversation != null)
            {
                Conversations.Insert(0, conversation);
                SelectedConversation = conversation;
                ConversationTitle = string.Empty;
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
        if (SelectedConversation == null || string.IsNullOrEmpty(NewMessage))
        {
            ErrorMessage = "请选择对话并输入消息";
            return;
        }

        try
        {
            IsLoading = true;
            IsStreaming = true;
            ErrorMessage = string.Empty;

            var messageData = new
            {
                content = NewMessage
            };

            var userMessage = await _apiService.PostAsync<AiMessage>($"/ai-conversations/{SelectedConversation.Id}/messages", messageData);
            if (userMessage != null)
            {
                Messages.Add(userMessage);
            }

            NewMessage = string.Empty;

            var response = await _apiService.PostAsync<AiMessage>($"/ai-conversations/{SelectedConversation.Id}/chat", messageData);
            if (response != null)
            {
                Messages.Add(response);
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
            IsStreaming = false;
        }
    }

    [RelayCommand]
    private async Task DeleteConversationAsync(string conversationId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            await _apiService.DeleteAsync<object>($"/ai-conversations/{conversationId}");
            var conversation = Conversations.FirstOrDefault(c => c.Id == conversationId);
            if (conversation != null)
            {
                Conversations.Remove(conversation);
                if (SelectedConversation?.Id == conversationId)
                {
                    SelectedConversation = null;
                    Messages.Clear();
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
}

using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly AuthService _authService;
    private readonly ChatService _chatService;
    private readonly LiveService _liveService;

    [ObservableProperty]
    private User? _currentUser;

    [ObservableProperty]
    private bool _isLoggedIn;

    [ObservableProperty]
    private string _greeting = string.Empty;

    public MainViewModel(AuthService authService, ChatService chatService, LiveService liveService)
    {
        _authService = authService;
        _chatService = chatService;
        _liveService = liveService;

        CurrentUser = _authService.CurrentUser;
        IsLoggedIn = _authService.IsLoggedIn;
        UpdateGreeting();
    }

    private void UpdateGreeting()
    {
        var hour = DateTime.Now.Hour;
        if (hour < 12)
        {
            Greeting = "早上好";
        }
        else if (hour < 18)
        {
            Greeting = "下午好";
        }
        else
        {
            Greeting = "晚上好";
        }

        if (CurrentUser != null)
        {
            Greeting += $", {CurrentUser.DisplayName ?? CurrentUser.Username}!";
        }
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        await _authService.LogoutAsync();
        CurrentUser = null;
        IsLoggedIn = false;
        UpdateGreeting();
    }

    public void RefreshUser()
    {
        CurrentUser = _authService.CurrentUser;
        IsLoggedIn = _authService.IsLoggedIn;
        UpdateGreeting();
    }
}

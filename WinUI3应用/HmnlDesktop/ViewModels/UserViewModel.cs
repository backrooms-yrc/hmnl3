using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;

namespace HmnlDesktop.ViewModels;

public partial class UserViewModel : ObservableObject
{
    private readonly AuthService _authService;

    [ObservableProperty]
    private string _username = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _phone = string.Empty;

    [ObservableProperty]
    private string _displayName = string.Empty;

    [ObservableProperty]
    private string _bio = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    [ObservableProperty]
    private User? _currentUser;

    public UserViewModel(AuthService authService)
    {
        _authService = authService;
        CurrentUser = _authService.CurrentUser;
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var request = new LoginRequest
            {
                Username = Username,
                Password = Password
            };

            var response = await _authService.LoginAsync(request);
            if (response != null)
            {
                CurrentUser = response.User;
                ClearForm();
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
    private async Task RegisterAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var request = new RegisterRequest
            {
                Username = Username,
                Password = Password,
                Email = string.IsNullOrEmpty(Email) ? null : Email,
                Phone = string.IsNullOrEmpty(Phone) ? null : Phone
            };

            var user = await _authService.RegisterAsync(request);
            if (user != null)
            {
                CurrentUser = user;
                ClearForm();
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
    private async Task UpdateProfileAsync()
    {
        if (CurrentUser == null) return;

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var updatedUser = new User
            {
                Id = CurrentUser.Id,
                Username = CurrentUser.Username,
                DisplayName = string.IsNullOrEmpty(DisplayName) ? CurrentUser.DisplayName : DisplayName,
                Bio = string.IsNullOrEmpty(Bio) ? CurrentUser.Bio : Bio,
                Email = CurrentUser.Email,
                Phone = CurrentUser.Phone,
                AvatarUrl = CurrentUser.AvatarUrl,
                IsVerified = CurrentUser.IsVerified,
                IsResident = CurrentUser.IsResident,
                CreatedAt = CurrentUser.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            };

            var user = await _authService.UpdateProfileAsync(updatedUser);
            if (user != null)
            {
                CurrentUser = user;
                ClearForm();
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

    private void ClearForm()
    {
        Username = string.Empty;
        Password = string.Empty;
        Email = string.Empty;
        Phone = string.Empty;
        DisplayName = string.Empty;
        Bio = string.Empty;
    }

    public void LoadCurrentUser()
    {
        CurrentUser = _authService.CurrentUser;
    }
}

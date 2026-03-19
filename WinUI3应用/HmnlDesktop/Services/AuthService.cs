using Microsoft.Extensions.Configuration;
using HmnlDesktop.Models;

namespace HmnlDesktop.Services;

public class AuthService
{
    private readonly ApiService _apiService;
    private readonly StorageService _storageService;

    public User? CurrentUser { get; private set; }
    public bool IsLoggedIn => CurrentUser != null;

    public AuthService(ApiService apiService, StorageService storageService)
    {
        _apiService = apiService;
        _storageService = storageService;
        LoadSavedUser();
    }

    private async void LoadSavedUser()
    {
        var token = await _storageService.GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(token))
        {
            _apiService.SetAccessToken(token);
            var user = await _storageService.GetUserAsync();
            CurrentUser = user;
        }
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        try
        {
            var response = await _apiService.PostAsync<AuthResponse>("/auth/login", request);
            if (response != null)
            {
                CurrentUser = response.User;
                _apiService.SetAccessToken(response.AccessToken);
                await _storageService.SaveAccessTokenAsync(response.AccessToken);
                await _storageService.SaveUserAsync(response.User);
            }
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"登录失败: {ex.Message}", ex);
        }
    }

    public async Task<User?> RegisterAsync(RegisterRequest request)
    {
        try
        {
            var user = await _apiService.PostAsync<User>("/auth/register", request);
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception($"注册失败: {ex.Message}", ex);
        }
    }

    public async Task LogoutAsync()
    {
        CurrentUser = null;
        _apiService.SetAccessToken(null);
        await _storageService.ClearAuthDataAsync();
    }

    public async Task<User?> UpdateProfileAsync(User user)
    {
        try
        {
            var updatedUser = await _apiService.PutAsync<User>($"/users/{user.Id}", user);
            if (updatedUser != null)
            {
                CurrentUser = updatedUser;
                await _storageService.SaveUserAsync(updatedUser);
            }
            return updatedUser;
        }
        catch (Exception ex)
        {
            throw new Exception($"更新资料失败: {ex.Message}", ex);
        }
    }
}

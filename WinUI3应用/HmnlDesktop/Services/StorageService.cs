using Windows.Storage;

namespace HmnlDesktop.Services;

public class StorageService
{
    private const string AccessTokenKey = "access_token";
    private const string UserKey = "user_data";

    public async Task<string?> GetAccessTokenAsync()
    {
        try
        {
            var localSettings = ApplicationData.Current.LocalSettings;
            if (localSettings.Values.TryGetValue(AccessTokenKey, out var token))
            {
                return token?.ToString();
            }
        }
        catch (Exception)
        {
        }
        return null;
    }

    public async Task SaveAccessTokenAsync(string token)
    {
        try
        {
            var localSettings = ApplicationData.Current.LocalSettings;
            localSettings.Values[AccessTokenKey] = token;
        }
        catch (Exception)
        {
        }
        await Task.CompletedTask;
    }

    public async Task<HmnlDesktop.Models.User?> GetUserAsync()
    {
        try
        {
            var localSettings = ApplicationData.Current.LocalSettings;
            if (localSettings.Values.TryGetValue(UserKey, out var userData))
            {
                var json = userData?.ToString();
                if (!string.IsNullOrEmpty(json))
                {
                    return System.Text.Json.JsonSerializer.Deserialize<HmnlDesktop.Models.User>(json);
                }
            }
        }
        catch (Exception)
        {
        }
        return null;
    }

    public async Task SaveUserAsync(HmnlDesktop.Models.User user)
    {
        try
        {
            var localSettings = ApplicationData.Current.LocalSettings;
            var json = System.Text.Json.JsonSerializer.Serialize(user);
            localSettings.Values[UserKey] = json;
        }
        catch (Exception)
        {
        }
        await Task.CompletedTask;
    }

    public async Task ClearAuthDataAsync()
    {
        try
        {
            var localSettings = ApplicationData.Current.LocalSettings;
            localSettings.Values.Remove(AccessTokenKey);
            localSettings.Values.Remove(UserKey);
        }
        catch (Exception)
        {
        }
        await Task.CompletedTask;
    }
}

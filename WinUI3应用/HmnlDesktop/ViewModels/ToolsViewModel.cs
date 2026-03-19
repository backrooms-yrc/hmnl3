using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class ToolsViewModel : ObservableObject
{
    private readonly ApiService _apiService;

    [ObservableProperty]
    private string _weatherCity = string.Empty;

    [ObservableProperty]
    private string _weatherResult = string.Empty;

    [ObservableProperty]
    private string _mapLocation = string.Empty;

    [ObservableProperty]
    private string _animasInput = string.Empty;

    [ObservableProperty]
    private string _animasResult = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    public ToolsViewModel(ApiService apiService)
    {
        _apiService = apiService;
    }

    [RelayCommand]
    private async Task GetWeatherAsync()
    {
        if (string.IsNullOrEmpty(WeatherCity))
        {
            ErrorMessage = "请输入城市名称";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var weather = await _apiService.GetAsync<dynamic>($"/tools/weather?city={Uri.EscapeDataString(WeatherCity)}");
            if (weather != null)
            {
                WeatherResult = $"城市: {WeatherCity}\n" +
                               $"温度: {weather.temperature}°C\n" +
                               $"天气: {weather.description}\n" +
                               $"湿度: {weather.humidity}%";
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
    private void OpenMap()
    {
        if (string.IsNullOrEmpty(MapLocation))
        {
            ErrorMessage = "请输入位置信息";
            return;
        }

        try
        {
            var url = $"https://www.google.com/maps/search/{Uri.EscapeDataString(MapLocation)}";
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
    }

    [RelayCommand]
    private async Task SolveAnimasAsync()
    {
        if (string.IsNullOrEmpty(AnimasInput))
        {
            ErrorMessage = "请输入Animas谜题";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var result = await _apiService.PostAsync<dynamic>("/tools/animas", new { input = AnimasInput });
            if (result != null)
            {
                AnimasResult = $"谜题: {AnimasInput}\n" +
                              $"答案: {result.answer}\n" +
                              $"解析: {result.explanation}";
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

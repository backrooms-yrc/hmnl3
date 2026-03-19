using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class LiveViewModel : ObservableObject
{
    private readonly LiveService _liveService;
    private readonly AuthService _authService;

    [ObservableProperty]
    private ObservableCollection<LiveStream> _liveStreams = new();

    [ObservableProperty]
    private LiveStream? _selectedStream;

    [ObservableProperty]
    private ObservableCollection<LiveInteraction> _interactions = new();

    [ObservableProperty]
    private string _streamTitle = string.Empty;

    [ObservableProperty]
    private string _streamDescription = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    [ObservableProperty]
    private bool _isPlaying;

    public LiveViewModel(LiveService liveService, AuthService authService)
    {
        _liveService = liveService;
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoadLiveStreamsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var streams = await _liveService.GetLiveStreamsAsync();
            if (streams != null)
            {
                LiveStreams.Clear();
                foreach (var stream in streams)
                {
                    LiveStreams.Add(stream);
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
    private async Task SelectStreamAsync(LiveStream? stream)
    {
        if (stream == null) return;

        SelectedStream = stream;
        IsPlaying = false;
        await LoadInteractionsAsync(stream.ChannelId);
    }

    [RelayCommand]
    private async Task StartLiveAsync(string channelId)
    {
        if (string.IsNullOrEmpty(StreamTitle))
        {
            ErrorMessage = "请输入直播标题";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var stream = await _liveService.StartLiveStreamAsync(channelId, StreamTitle, StreamDescription);
            if (stream != null)
            {
                LiveStreams.Insert(0, stream);
                SelectedStream = stream;
                StreamTitle = string.Empty;
                StreamDescription = string.Empty;
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
    private async Task StopLiveAsync()
    {
        if (SelectedStream == null) return;

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            await _liveService.StopLiveStreamAsync(SelectedStream.Id);
            SelectedStream.IsLive = false;
            IsPlaying = false;
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
    private void PlayStream()
    {
        if (SelectedStream == null) return;
        IsPlaying = true;
    }

    [RelayCommand]
    private void StopStream()
    {
        IsPlaying = false;
    }

    [RelayCommand]
    private async Task LoadInteractionsAsync(string channelId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var interactions = await _liveService.GetInteractionsAsync(channelId);
            if (interactions != null)
            {
                Interactions.Clear();
                foreach (var interaction in interactions)
                {
                    Interactions.Add(interaction);
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
    private async Task CreateAnnouncementAsync(string channelId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var interaction = await _liveService.CreateInteractionAsync(channelId, "announcement", "直播公告", StreamDescription);
            if (interaction != null)
            {
                Interactions.Add(interaction);
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

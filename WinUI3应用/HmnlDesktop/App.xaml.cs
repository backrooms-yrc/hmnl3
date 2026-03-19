using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using HmnlDesktop.Services;
using HmnlDesktop.ViewModels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;

namespace HmnlDesktop;

public partial class App : Application
{
    public static Window? MainWindow { get; private set; }
    public static IServiceProvider? Services { get; private set; }

    public App()
    {
        InitializeComponent();
        ConfigureServices();
    }

    private void ConfigureServices()
    {
        var services = new ServiceCollection();

        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        services.AddSingleton<IConfiguration>(configuration);

        services.AddSingleton<ApiService>();
        services.AddSingleton<AuthService>();
        services.AddSingleton<ChatService>();
        services.AddSingleton<LiveService>();
        services.AddSingleton<StorageService>();

        services.AddTransient<MainViewModel>();
        services.AddTransient<UserViewModel>();
        services.AddTransient<PostViewModel>();
        services.AddTransient<ChatViewModel>();
        services.AddTransient<LiveViewModel>();
        services.AddTransient<AiViewModel>();
        services.AddTransient<ToolsViewModel>();

        Services = services.BuildServiceProvider();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        MainWindow = new MainWindow();
        MainWindow.Activate();
    }
}

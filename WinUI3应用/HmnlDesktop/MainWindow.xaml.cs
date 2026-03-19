using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using HmnlDesktop.Views;

namespace HmnlDesktop;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        this.InitializeComponent();
        MainNavigation.SelectedItem = MainNavigation.MenuItems[0];
        ContentFrame.Navigate(typeof(HomePage));
    }

    private void MainNavigation_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
    {
        if (args.SelectedItem is NavigationViewItem item)
        {
            var tag = item.Tag?.ToString();
            NavigateToPage(tag);
        }
    }

    private void NavigateToPage(string? tag)
    {
        Type? pageType = tag switch
        {
            "home" => typeof(HomePage),
            "posts" => typeof(PostPage),
            "chat" => typeof(ChatPage),
            "live" => typeof(LivePage),
            "ai" => typeof(AiPage),
            "tools" => typeof(ToolsPage),
            _ => typeof(HomePage)
        };

        if (pageType != null)
        {
            ContentFrame.Navigate(pageType);
        }
    }
}

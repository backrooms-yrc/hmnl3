using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using HmnlDesktop.Services;
using HmnlDesktop.Models;
using System.Collections.ObjectModel;

namespace HmnlDesktop.ViewModels;

public partial class PostViewModel : ObservableObject
{
    private readonly ApiService _apiService;
    private readonly AuthService _authService;

    [ObservableProperty]
    private ObservableCollection<Post> _posts = new();

    [ObservableProperty]
    private Post? _selectedPost;

    [ObservableProperty]
    private string _searchQuery = string.Empty;

    [ObservableProperty]
    private string _newPostTitle = string.Empty;

    [ObservableProperty]
    private string _newPostContent = string.Empty;

    [ObservableProperty]
    private string _newCommentContent = string.Empty;

    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    public PostViewModel(ApiService apiService, AuthService authService)
    {
        _apiService = apiService;
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoadPostsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var posts = await _apiService.GetAsync<List<Post>>("/posts");
            if (posts != null)
            {
                Posts.Clear();
                foreach (var post in posts)
                {
                    Posts.Add(post);
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
    private async Task SearchPostsAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var posts = await _apiService.GetAsync<List<Post>>($"/posts/search?q={Uri.EscapeDataString(SearchQuery)}");
            if (posts != null)
            {
                Posts.Clear();
                foreach (var post in posts)
                {
                    Posts.Add(post);
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
    private async Task CreatePostAsync()
    {
        if (string.IsNullOrEmpty(NewPostTitle) || string.IsNullOrEmpty(NewPostContent))
        {
            ErrorMessage = "标题和内容不能为空";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var postData = new
            {
                title = NewPostTitle,
                content = NewPostContent
            };

            var post = await _apiService.PostAsync<Post>("/posts", postData);
            if (post != null)
            {
                Posts.Insert(0, post);
                NewPostTitle = string.Empty;
                NewPostContent = string.Empty;
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
    private async Task LikePostAsync(string postId)
    {
        try
        {
            await _apiService.PostAsync<object>($"/posts/{postId}/like", new { });
            var post = Posts.FirstOrDefault(p => p.Id == postId);
            if (post != null)
            {
                post.IsLiked = !post.IsLiked;
                post.LikesCount += post.IsLiked ? 1 : -1;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
    }

    [RelayCommand]
    private async Task AddCommentAsync(string postId)
    {
        if (string.IsNullOrEmpty(NewCommentContent))
        {
            ErrorMessage = "评论内容不能为空";
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var commentData = new
            {
                content = NewCommentContent
            };

            var comment = await _apiService.PostAsync<Comment>($"/posts/{postId}/comments", commentData);
            if (comment != null)
            {
                var post = Posts.FirstOrDefault(p => p.Id == postId);
                if (post != null)
                {
                    post.CommentsCount++;
                }
                NewCommentContent = string.Empty;
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
